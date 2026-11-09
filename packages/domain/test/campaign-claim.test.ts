import { describe, expect, it } from "vitest";
import { activateCampaign, activationProblems, commitmentPreview, isLive } from "../src/campaign.js";
import { canTransition, InvalidTransitionError, isTerminal, transition, type Claim } from "../src/claim.js";
import { campaign, T0 } from "./fixtures.js";

describe("campañas", () => {
  it("una campaña completa y financiada se activa", () => {
    expect(activateCampaign(campaign()).status).toBe("active");
  });

  it("no se activa sin fuente de financiación confirmada", () => {
    expect(() => activateCampaign(campaign({ fundingConfirmed: false }))).toThrow(/financiación/);
  });

  it("lista todos los problemas juntos", () => {
    const problems = activationProblems(
      campaign({ budget: 0, skus: [], merchantIds: [], endsAt: new Date("2026-01-01") }),
    );
    expect(problems.length).toBeGreaterThanOrEqual(4);
  });

  it("limita el piloto a 10 comercios", () => {
    const ids = Array.from({ length: 11 }, (_, i) => `m-${i}`);
    expect(activationProblems(campaign({ merchantIds: ids }))).toContain("el piloto admite hasta 10 comercios");
  });

  it("solo está viva dentro de su vigencia", () => {
    const c = activateCampaign(campaign());
    expect(isLive(c, T0)).toBe(true);
    expect(isLive(c, new Date("2027-01-01"))).toBe(false);
  });

  it("previsualiza compromisos máximos por SKU", () => {
    expect(commitmentPreview(campaign())).toEqual([{ sku: "YERBA-500", unitCost: 151_650, maxPurchases: 329 }]);
  });
});

describe("estados del reclamo", () => {
  const base: Claim = {
    id: "c1",
    campaignId: "camp-1",
    merchantId: "m-1",
    skuCode: "YERBA-500",
    buyerKey: "b",
    status: "submitted",
    claimedAt: T0,
    purchasedAt: T0,
    payoutBlocked: false,
  };
  const system = { kind: "system" } as const;

  it("recorre el camino feliz y deja un evento por paso", () => {
    const a = transition(base, "approved", system, "nivel A");
    const b = transition(a.claim, "payout_pending", system, "orden creada");
    const c = transition(b.claim, "paid", { kind: "payment_provider", ref: "mp-1" }, "acreditado");
    expect(c.claim.status).toBe("paid");
    expect([a.event, b.event, c.event].map((e) => e.to)).toEqual(["approved", "payout_pending", "paid"]);
  });

  it("no permite saltar estados", () => {
    expect(() => transition(base, "paid", system, "x")).toThrow(InvalidTransitionError);
  });

  it("el bloqueo del operador detiene el envío de pago", () => {
    const approved = transition(base, "approved", system, "ok").claim;
    expect(() => transition({ ...approved, payoutBlocked: true }, "payout_pending", system, "orden")).toThrow(
      InvalidTransitionError,
    );
  });

  it("un pago fallido queda reintentable", () => {
    expect(canTransition("payout_failed", "payout_pending")).toBe(true);
    expect(canTransition("payout_failed", "paid")).toBe(false);
  });

  it("toda transición exige motivo", () => {
    expect(() => transition(base, "approved", system, "  ")).toThrow(/motivo/);
  });

  it("rejected, reversed y adjusted son terminales", () => {
    expect(["rejected", "reversed", "adjusted"].every((s) => isTerminal(s as Claim["status"]))).toBe(true);
  });
});
