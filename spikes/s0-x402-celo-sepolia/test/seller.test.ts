/**
 * Seller behaviour through its public HTTP interface (app.request), with the FAKE facilitator
 * injected. Nothing here touches a chain or the real facilitator.
 */
import { describe, expect, it } from "vitest";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createSellerApp } from "../src/seller.ts";
import { CELO_SEPOLIA } from "../src/network.ts";
import { FakeFacilitatorClient } from "./fake-facilitator.ts";
import { signPaymentHeader } from "./buyer-helpers.ts";

const PAY_TO = privateKeyToAccount(generatePrivateKey()).address;
const DATA_URL = "http://seller.test/v1/products/dp_test_fixture_milk_noa/data";

function setup() {
  const facilitator = new FakeFacilitatorClient();
  const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
  return { facilitator, app };
}

describe("discovery", () => {
  it("GET /v1/products is free and lists one fixture DataProduct with its price contract", async () => {
    const { app, facilitator } = setup();
    const res = await app.request("http://seller.test/v1/products");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { products: Array<Record<string, any>> };
    expect(body.products).toHaveLength(1);
    const p = body.products[0]!;
    expect(p.dataProductId).toBe("dp_test_fixture_milk_noa");
    expect(p.fixture).toBe(true);
    expect(p.price).toEqual({
      amountAtomic: "10000",
      token: { network: "eip155:11142220", address: "0x01C5C0122039549AD1493B8220cABEdD739BC44E", symbol: "USDC", decimals: 6 },
      unit: "query",
    });
    expect(Object.keys(p)).toEqual(
      expect.arrayContaining(["title", "coverage", "freshness", "origin", "minVerificationLevel", "counts", "license"]),
    );
    // The middleware syncs /supported in the background at startup; discovery never verifies or settles.
    expect(facilitator.calls).toMatchObject({ verify: 0, settle: 0 });
  });
});

describe("paid route", () => {
  it("without payment answers 402 with decodable exact/USDC/Celo Sepolia requirements", async () => {
    const { app, facilitator } = setup();
    const res = await app.request(DATA_URL);
    expect(res.status).toBe(402);
    const header = res.headers.get("payment-required");
    expect(header).toBeTruthy();
    const required = decodePaymentRequiredHeader(header!);
    expect(required.x402Version).toBe(2);
    expect(required.accepts).toHaveLength(1);
    expect(required.accepts[0]).toMatchObject({
      scheme: "exact",
      network: "eip155:11142220",
      asset: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
      amount: "10000",
      payTo: PAY_TO,
      extra: { name: "USDC", version: "2" },
    });
    expect(required.extensions).toHaveProperty("payment-identifier");
    expect(await res.text()).not.toContain("Leche");
    expect(facilitator.calls.verify).toBe(0);
    expect(facilitator.calls.settle).toBe(0);
  });

  it("with a valid signed payment verifies, settles once and delivers the data with a payment-response", async () => {
    const { app, facilitator } = setup();
    const paymentHeader = await signPaymentHeader(app, DATA_URL);
    const res = await app.request(DATA_URL, { headers: paymentHeader });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { dataProductId: string; fixture: boolean };
    expect(body).toMatchObject({ dataProductId: "dp_test_fixture_milk_noa", fixture: true });
    const settled = decodePaymentResponseHeader(res.headers.get("payment-response")!);
    expect(settled.success).toBe(true);
    expect(settled.network).toBe(CELO_SEPOLIA.caip2);
    expect(settled.transaction).toBe(facilitator.settlements[0]!.transaction);
    expect(facilitator.calls).toMatchObject({ verify: 1, settle: 1 });
    expect(facilitator.settlements).toHaveLength(1);
    expect(facilitator.settlements[0]).toMatchObject({ to: PAY_TO, value: "10000" });
  });
});
