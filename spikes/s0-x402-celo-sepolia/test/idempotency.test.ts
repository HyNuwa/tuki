/**
 * Double-charge protection through the seller's HTTP interface, FAKE facilitator.
 * The fake enforces single-use EIP-3009 nonces like the token contract does, so a second
 * entry in `facilitator.settlements` means the buyer would have been charged twice.
 */
import { describe, expect, it } from "vitest";
import { decodePaymentResponseHeader } from "@x402/core/http";
import { createSellerApp } from "../src/seller.ts";
import { FakeFacilitatorClient } from "./fake-facilitator.ts";
import { newTestAccount, signPaymentHeader } from "./buyer-helpers.ts";

const PAY_TO = newTestAccount().address;
const DATA_URL = "http://seller.test/v1/products/dp_test_fixture_milk_noa/data";
const txOf = (res: Response) => decodePaymentResponseHeader(res.headers.get("payment-response")!).transaction;

function setup() {
  const facilitator = new FakeFacilitatorClient();
  const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
  return { facilitator, app };
}

describe("idempotency", () => {
  it("replaying the exact same payment header returns the first settlement and does not settle again", async () => {
    const { app, facilitator } = setup();
    const headers = await signPaymentHeader(app, DATA_URL);
    const first = await app.request(DATA_URL, { headers });
    const replay = await app.request(DATA_URL, { headers });
    expect(first.status).toBe(200);
    expect(replay.status).toBe(200);
    expect(txOf(replay)).toBe(txOf(first));
    expect(facilitator.calls.settle).toBe(1);
    expect(facilitator.settlements).toHaveLength(1);
  });

  it("a re-signed retry with the same payment-identifier is not charged twice", async () => {
    const { app, facilitator } = setup();
    const account = newTestAccount();
    const paymentId = "pay_same_purchase_0000000001";
    const first = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account, paymentId }) });
    const retry = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account, paymentId }) });
    expect(first.status).toBe(200);
    expect(retry.status).toBe(200);
    expect(txOf(retry)).toBe(txOf(first));
    expect(facilitator.settlements).toHaveLength(1);
  });

  it("the same payment-identifier from a different payer is a different purchase", async () => {
    const { app, facilitator } = setup();
    const paymentId = "pay_shared_id_000000000001";
    const a = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account: newTestAccount(), paymentId }) });
    const b = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account: newTestAccount(), paymentId }) });
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(txOf(b)).not.toBe(txOf(a));
    expect(facilitator.settlements).toHaveLength(2);
  });

  it("two concurrent requests for the same purchase settle once", async () => {
    const { app, facilitator } = setup();
    facilitator.settleDelayMs = 50;
    const account = newTestAccount();
    const paymentId = "pay_concurrent_000000000001";
    const [h1, h2] = await Promise.all([
      signPaymentHeader(app, DATA_URL, { account, paymentId }),
      signPaymentHeader(app, DATA_URL, { account, paymentId }),
    ]);
    const [r1, r2] = await Promise.all([app.request(DATA_URL, { headers: h1 }), app.request(DATA_URL, { headers: h2 })]);
    expect([r1.status, r2.status]).toEqual([200, 200]);
    expect(txOf(r1)).toBe(txOf(r2));
    expect(facilitator.calls.settle).toBe(1);
    expect(facilitator.settlements).toHaveLength(1);
  });

  it("after a settle timeout (unknown outcome) a retry of the same purchase is refused, not settled again", async () => {
    const { app, facilitator } = setup();
    facilitator.planSettle("timeout");
    const account = newTestAccount();
    const paymentId = "pay_indeterminate_00000000001";
    const first = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account, paymentId }) });
    expect(first.status).toBe(502);
    const retry = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account, paymentId }) });
    expect(retry.status).toBe(402);
    expect(decodePaymentResponseHeader(retry.headers.get("payment-response")!)).toMatchObject({
      success: false,
      errorReason: "settlement_outcome_unknown",
    });
    expect(await retry.text()).not.toContain("TEST FIXTURE");
    expect(facilitator.calls.settle).toBe(1);
  });
});
