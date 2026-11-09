import { describe, expect, it } from "vitest";
import { CampaignLedger, LedgerError } from "../src/ledger.js";
import { classifyEvidence, evaluateClaim } from "../src/verification.js";
import { claimInput, context, minutes } from "./fixtures.js";

describe("verificación", () => {
  it("código del comercio + pago coincidente = nivel A, aprobado", () => {
    const r = evaluateClaim(claimInput(), context());
    expect(r).toEqual({ outcome: "approve", evidenceLevel: "A", reasons: [] });
  });

  it("el mismo ticket enviado dos veces se rechaza", () => {
    const r = evaluateClaim(claimInput(), context({ fingerprintAlreadySeen: true }));
    expect(r.outcome).toBe("reject");
    expect(r.reasons).toContain("DUPLICATE_EVIDENCE");
  });

  it("producto o comercio ajeno a la campaña no es elegible", () => {
    const sku = evaluateClaim(claimInput({ skuCode: "OTRO" }), context());
    const merchant = evaluateClaim(claimInput({ merchantId: "m-99" }), context());
    expect(sku.reasons).toContain("SKU_NOT_ELIGIBLE");
    expect(merchant.reasons).toContain("MERCHANT_NOT_IN_CAMPAIGN");
  });

  it("un comprador solo cobra una primera prueba", () => {
    expect(evaluateClaim(claimInput(), context({ buyerClaimsInCampaign: 1 })).reasons).toContain("BUYER_LIMIT_REACHED");
  });

  it("el comercio no puede superar las unidades que le compró al distribuidor", () => {
    const r = evaluateClaim(claimInput(), context({ merchantSellInUnits: 24, merchantApprovedClaimsForSku: 24 }));
    expect(r.reasons).toContain("SELL_IN_CAP_REACHED");
  });

  it("cerca del techo de sell-in todo va a revisión", () => {
    const r = evaluateClaim(claimInput(), context({ merchantSellInUnits: 24, merchantApprovedClaimsForSku: 19 }));
    expect(r.outcome).toBe("review");
    expect(r.reasons).toContain("NEAR_SELL_IN_CAP");
  });

  it("sin presupuesto disponible se rechaza", () => {
    expect(evaluateClaim(claimInput(), context({ budgetAvailable: 100 })).reasons).toContain("BUDGET_EXHAUSTED");
  });

  it("monto de pago sin artículos ni código = evidencia insuficiente, va a revisión", () => {
    const input = claimInput({
      evidence: { paymentProof: { merchantCuit: "20-11111111-1", amount: 312_600, paidAt: minutes(1) } },
    });
    const r = evaluateClaim(input, context());
    expect(r.outcome).toBe("review");
    expect(r.evidenceLevel).toBe("insufficient");
    expect(r.reasons).toContain("INSUFFICIENT_EVIDENCE");
  });

  it("pago a otro CUIT se marca como inconsistente", () => {
    const input = claimInput({
      evidence: {
        merchantCode: { valid: true, merchantId: "m-1" },
        paymentProof: { merchantCuit: "20-99999999-9", amount: 312_600, paidAt: minutes(1) },
      },
    });
    const r = evaluateClaim(input, context());
    expect(r.outcome).toBe("review");
    expect(r.reasons).toContain("PAYMENT_MISMATCH");
  });

  it("código inválido se rechaza", () => {
    const input = claimInput({ evidence: { merchantCode: { valid: false, merchantId: "m-1" } } });
    expect(evaluateClaim(input, context()).reasons).toContain("MERCHANT_CODE_INVALID");
  });

  it("muchos reclamos por hora en un comercio disparan revisión", () => {
    const r = evaluateClaim(claimInput(), context({ merchantClaimsLastHour: 15 }));
    expect(r.reasons).toContain("MERCHANT_VELOCITY");
  });

  it("solo código del comercio = nivel B", () => {
    const input = claimInput({ evidence: { merchantCode: { valid: true, merchantId: "m-1" } } });
    expect(classifyEvidence(input, context())).toBe("B");
  });

  it("el muestreo de auditoría es determinístico (~1 de cada 10 en nivel B)", () => {
    const outcomes = Array.from({ length: 200 }, (_, i) =>
      evaluateClaim(
        claimInput({ id: `claim-${i}`, evidence: { merchantCode: { valid: true, merchantId: "m-1" } } }),
        context(),
      ),
    );
    const audited = outcomes.filter((o) => o.reasons.includes("AUDIT_SAMPLE")).length;
    expect(audited).toBeGreaterThan(5);
    expect(audited).toBeLessThan(45);
    const again = evaluateClaim(claimInput({ id: "claim-7", evidence: { merchantCode: { valid: true, merchantId: "m-1" } } }), context());
    expect(again).toEqual(outcomes[7]);
  });
});

describe("libro mayor", () => {
  it("reserva antes de pagar y nunca supera el presupuesto", () => {
    const l = new CampaignLedger(300_000);
    l.reserve("a", 151_650);
    expect(() => l.reserve("b", 151_650)).toThrow(LedgerError);
    expect(l.available).toBe(148_350);
  });

  it("una misma claim no se reserva dos veces", () => {
    const l = new CampaignLedger(1_000_000);
    l.reserve("a", 100);
    expect(() => l.reserve("a", 100)).toThrow(/ya tiene una reserva/);
  });

  it("un webhook duplicado acredita una sola vez", () => {
    const l = new CampaignLedger(1_000_000);
    l.reserve("a", 100);
    expect(l.settle("a")).toBeDefined();
    expect(l.settle("a")).toBeUndefined();
    expect(l.history().filter((e) => e.type === "settle")).toHaveLength(1);
  });

  it("liberar devuelve el presupuesto", () => {
    const l = new CampaignLedger(1_000);
    l.reserve("a", 600);
    l.release("a");
    expect(l.available).toBe(1_000);
  });

  it("una reversa es un asiento compensatorio, no un borrado", () => {
    const l = new CampaignLedger(1_000);
    l.reserve("a", 600);
    l.settle("a");
    l.reverse("a");
    expect(l.history().map((e) => e.type)).toEqual(["reserve", "settle", "reverse"]);
    expect(l.statusOf("a")).toBe("reversed");
    expect(l.available).toBe(1_000);
  });

  it("no se puede revertir algo que no se pagó", () => {
    const l = new CampaignLedger(1_000);
    l.reserve("a", 600);
    expect(() => l.reverse("a")).toThrow(/se esperaba settled/);
  });
});
