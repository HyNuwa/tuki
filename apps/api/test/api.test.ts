import { beforeEach, describe, expect, it } from "vitest";
import { buildServer } from "../src/server.js";
import { Service } from "../src/service.js";

const NOW = new Date("2026-12-01T12:00:00-03:00");
const op = { "x-role": "operator", "x-actor-id": "op-1" };
const CVU = (n: number) => String(n).padStart(22, "0");

let service: Service;
let app: ReturnType<typeof buildServer>;
let merchantId: string;
let campaignId: string;

async function post(url: string, payload: unknown, headers: Record<string, string> = op) {
  return app.inject({ method: "POST", url, payload: payload as object, headers });
}

async function code(): Promise<string> {
  const r = await post(`/v1/campaigns/${campaignId}/merchant-codes`, { merchantId }, { "x-role": "merchant", "x-actor-id": merchantId });
  return r.json().code;
}

async function claim(n: number, extra: Record<string, unknown> = {}) {
  return post(
    "/v1/claims",
    {
      campaignId,
      merchantId,
      skuCode: "YERBA-500",
      cvu: CVU(n),
      purchasedAt: NOW.toISOString(),
      merchantCode: await code(),
      paymentProof: { merchantCuit: "20-11111111-1", amount: 312_600, paidAt: NOW.toISOString() },
      ...extra,
    },
    { "idempotency-key": `idem-${n}-${JSON.stringify(extra).length}` },
  );
}

beforeEach(async () => {
  service = new Service("sal-de-prueba-larga-123", () => NOW);
  app = buildServer(service);
  const m = await post("/v1/merchants", { name: "Almacén Don Pepe", cuit: "20-11111111-1", phone: "+5493880000000", address: "Belgrano 100" });
  merchantId = m.json().id;
  await post(`/v1/merchants/${merchantId}/approve`, {});
  await post(`/v1/merchants/${merchantId}/sell-in`, { invoiceRef: "FA-0001-00000123", skuCode: "YERBA-500", units: 3 });
  const c = await post(
    "/v1/campaigns",
    {
      brandId: "brand-1",
      name: "Prueba yerba",
      skus: [{ code: "YERBA-500", name: "Yerba 500 g", price: 312_600 }],
      merchantIds: [merchantId],
      startsAt: "2026-11-25T00:00:00-03:00",
      endsAt: "2026-12-09T23:59:59-03:00",
      budget: 50_000_000,
      pricing: { reward: { kind: "percentOfPrice", bps: 2500, cap: 120_000 }, merchantIncentive: 23_500, platformFee: 50_000, launchFee: 0 },
      limits: { maxClaimsPerBuyer: 1 },
      fundingConfirmed: true,
    },
    { "x-role": "brand", "x-actor-id": "brand-1" },
  );
  campaignId = c.json().id;
});

describe("API de punta a punta", () => {
  it("una campaña sin activar no muestra ofertas; activada sí", async () => {
    expect((await app.inject(`/v1/offers?merchantId=${merchantId}`)).json()).toEqual([]);
    expect((await post(`/v1/campaigns/${campaignId}/activate`, {}, { "x-role": "brand", "x-actor-id": "brand-1" })).statusCode).toBe(403);
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    const offers = (await app.inject(`/v1/offers?merchantId=${merchantId}`)).json();
    expect(offers[0].skus[0]).toMatchObject({ code: "YERBA-500", reward: 78_150 });
  });

  it("compra → aprobación → pago → reporte agregado sin datos personales", async () => {
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    const r = await claim(1);
    expect(r.json()).toMatchObject({ status: "approved", evidenceLevel: "A" });

    const payout = (await post("/v1/payouts", { claimId: r.json().folio })).json();
    expect(payout.amount).toBe(78_150);
    const hook = { payoutId: payout.id, providerRef: "mp-123", result: "paid" };
    await post("/v1/payouts/webhook", hook);
    await post("/v1/payouts/webhook", hook); // duplicado

    const report = (await app.inject({ url: `/v1/campaigns/${campaignId}/report`, headers: { "x-role": "brand", "x-actor-id": "brand-1" } })).json();
    expect(report.spend.settled).toBe(151_650);
    expect(report.uniqueNewBuyers).toBe(1);
    expect(JSON.stringify(report)).not.toContain(CVU(1));
  });

  it("otra marca no puede ver el reporte", async () => {
    const r = await app.inject({ url: `/v1/campaigns/${campaignId}/report`, headers: { "x-role": "brand", "x-actor-id": "brand-2" } });
    expect(r.statusCode).toBe(403);
  });

  it("la misma Idempotency-Key devuelve el mismo folio", async () => {
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    const body = { campaignId, merchantId, skuCode: "YERBA-500", cvu: CVU(9), purchasedAt: NOW.toISOString(), merchantCode: await code() };
    const a = await post("/v1/claims", body, { "idempotency-key": "misma-clave-1" });
    const b = await post("/v1/claims", body, { "idempotency-key": "misma-clave-1" });
    expect(a.json().folio).toBe(b.json().folio);
  });

  it("un comprador cobra una sola primera prueba", async () => {
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    await claim(1);
    const again = await claim(1, { purchasedAt: new Date(NOW.getTime() + 60_000).toISOString() });
    expect(again.json()).toMatchObject({ status: "rejected", reasons: expect.arrayContaining(["BUYER_LIMIT_REACHED"]) });
  });

  it("el techo de sell-in frena la colusión del comercio", async () => {
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    const statuses = [];
    for (let i = 1; i <= 4; i++) statuses.push((await claim(i)).json().status);
    // 3 unidades compradas al distribuidor: la 3.ª va a revisión (cerca del techo) y la 4.ª se rechaza.
    expect(statuses).toEqual(["approved", "approved", "under_review", "rejected"]);
  });

  it("un pago bloqueado por el operador no sale", async () => {
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    const folio = (await claim(1)).json().folio;
    await post(`/v1/claims/${folio}/block`, { reason: "denuncia del comercio" });
    expect((await post("/v1/payouts", { claimId: folio })).json().error).toBe("PAYOUT_BLOCKED");
  });

  it("un pago fallido queda reintentable con la misma orden", async () => {
    await post(`/v1/campaigns/${campaignId}/activate`, {});
    const folio = (await claim(1)).json().folio;
    const p1 = (await post("/v1/payouts", { claimId: folio })).json();
    await post("/v1/payouts/webhook", { payoutId: p1.id, providerRef: "mp-1", result: "failed" });
    expect(service.claims.get(folio)!.status).toBe("payout_failed");
    const p2 = (await post("/v1/payouts", { claimId: folio })).json();
    expect(p2.id).toBe(p1.id);
    expect(service.claims.get(folio)!.status).toBe("payout_pending");
  });

  it("valida el CVU y exige Idempotency-Key", async () => {
    expect((await post("/v1/claims", { campaignId }, {})).statusCode).toBe(400);
    const bad = await post("/v1/claims", { campaignId, merchantId, skuCode: "YERBA-500", cvu: "123", purchasedAt: NOW }, { "idempotency-key": "clave-xyz-1" });
    expect(bad.json().error).toBe("VALIDATION");
  });
});
