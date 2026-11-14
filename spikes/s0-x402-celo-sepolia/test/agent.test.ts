/**
 * Buyer agent (simple automatic client, no LLM) against the in-process seller and the FAKE
 * facilitator. The agent signs with a throwaway in-memory key; nothing is broadcast.
 */
import { describe, expect, it } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSellerApp } from "../src/seller.ts";
import { createBuyerFetch, runAgent } from "../src/buyer.ts";
import { FIXTURE_PRODUCT } from "../src/catalog.ts";
import { FakeFacilitatorClient } from "./fake-facilitator.ts";

const BASE = "http://seller.test";
const PAY_TO = privateKeyToAccount(generatePrivateKey()).address;

function harness(priceAtomic = FIXTURE_PRODUCT.price.amountAtomic) {
  const facilitator = new FakeFacilitatorClient();
  const product = { ...FIXTURE_PRODUCT, price: { ...FIXTURE_PRODUCT.price, amountAtomic: priceAtomic } };
  const { app } = createSellerApp({ facilitator, payTo: PAY_TO, products: [product] });
  const sent: Request[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    sent.push(req.clone());
    return app.fetch(req);
  }) as typeof fetch;
  const privateKey = generatePrivateKey();
  return { facilitator, sent, fetchImpl, privateKey, account: privateKeyToAccount(privateKey) };
}

describe("buyer agent", () => {
  it("discovers the catalog, checks price and coverage, pays once and gets the data", async () => {
    const h = harness();
    const lines: string[] = [];
    const result = await runAgent({
      baseUrl: BASE,
      fetch: h.fetchImpl,
      account: h.account,
      budgetAtomic: "10000",
      wantZone: "AR-Y-San-Salvador-de-Jujuy",
      log: (l) => lines.push(l),
    });
    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") return;
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ dataProductId: FIXTURE_PRODUCT.dataProductId, fixture: true });
    expect(result.settlement).toMatchObject({ success: true, transaction: h.facilitator.settlements[0]!.transaction });
    expect(h.facilitator.settlements).toHaveLength(1);
    expect(lines.join("\n")).toContain(h.facilitator.settlements[0]!.transaction);
  });

  it("refuses to buy when the catalog price is above its budget, without sending any payment", async () => {
    const h = harness("20000");
    const result = await runAgent({ baseUrl: BASE, fetch: h.fetchImpl, account: h.account, budgetAtomic: "10000", wantZone: "AR-Y-San-Salvador-de-Jujuy", log: () => {} });
    expect(result).toMatchObject({ kind: "skipped", reason: "no product within budget and coverage" });
    expect(h.sent.some((r) => r.headers.has("payment-signature"))).toBe(false);
    expect(h.facilitator.calls.verify).toBe(0);
  });

  it("refuses when no product covers the wanted zone", async () => {
    const h = harness();
    const result = await runAgent({ baseUrl: BASE, fetch: h.fetchImpl, account: h.account, budgetAtomic: "10000", wantZone: "AR-C-CABA", log: () => {} });
    expect(result.kind).toBe("skipped");
    expect(h.sent.some((r) => r.headers.has("payment-signature"))).toBe(false);
  });

  it("client spend control rejects a 402 above the cap before signing: no payment header is sent", async () => {
    const h = harness("20000"); // seller now charges more than the buyer's cap
    const payFetch = createBuyerFetch({ account: h.account, capAtomic: "10000", fetch: h.fetchImpl });
    await expect(payFetch(`${BASE}/v1/products/${FIXTURE_PRODUCT.dataProductId}/data`)).rejects.toThrow(/spendControls/);
    expect(h.sent).toHaveLength(1);
    expect(h.sent[0]!.headers.has("payment-signature")).toBe(false);
    expect(h.facilitator.calls.verify).toBe(0);
  });

  it("never logs the private key", async () => {
    const h = harness();
    const lines: string[] = [];
    await runAgent({ baseUrl: BASE, fetch: h.fetchImpl, account: h.account, budgetAtomic: "10000", wantZone: "AR-Y-San-Salvador-de-Jujuy", log: (l) => lines.push(l) });
    const all = lines.join("\n").toLowerCase();
    expect(all).not.toContain(h.privateKey.toLowerCase());
    expect(all).not.toContain(h.privateKey.slice(2).toLowerCase());
  });
});
