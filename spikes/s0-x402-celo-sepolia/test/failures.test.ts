/**
 * Failure paths and retries through the seller's HTTP interface. FAKE facilitator, or the real
 * HTTPFacilitatorClient pointed at a local stub / closed port. Nothing reaches a chain.
 */
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import { createSellerApp } from "../src/seller.ts";
import { createFacilitatorClient } from "../src/facilitator.ts";
import { FakeFacilitatorClient } from "./fake-facilitator.ts";
import { newTestAccount, signPaymentHeader } from "./buyer-helpers.ts";

const PAY_TO = newTestAccount().address;
const DATA_URL = "http://seller.test/v1/products/dp_test_fixture_milk_noa/data";
const FIXTURE_MARKER = "TEST FIXTURE";

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise((r) => s.close(r))));
});

/** Local HTTP stub that answers /supported and hangs forever on /verify and /settle. */
async function hangingFacilitator(): Promise<string> {
  const server = createServer((req, res) => {
    if (req.url === "/supported") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ kinds: [{ x402Version: 2, scheme: "exact", network: "eip155:11142220" }], extensions: [], signers: {} }));
    }
    // otherwise never respond
  });
  servers.push(server);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe("failure paths deliver no resource", () => {
  it("verify rejects -> 402 with the reason, no data, no settle", async () => {
    const facilitator = new FakeFacilitatorClient().planVerify("reject");
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const res = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL) });
    expect(res.status).toBe(402);
    expect(decodePaymentRequiredHeader(res.headers.get("payment-required")!).error).toBe("fake_rejected_by_test");
    expect(await res.text()).not.toContain(FIXTURE_MARKER);
    expect(facilitator.calls.settle).toBe(0);
    expect(facilitator.settlements).toHaveLength(0);
  });

  it("settle fails -> 402, no data delivered, payment-response reports success:false, nothing settled", async () => {
    const facilitator = new FakeFacilitatorClient().planSettle("fail");
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const res = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL) });
    expect(res.status).toBe(402);
    expect(await res.text()).not.toContain(FIXTURE_MARKER);
    // Observed @x402/hono 2.31.0 behaviour: the failed settlement is reported in the header.
    const settled = decodePaymentResponseHeader(res.headers.get("payment-response")!);
    expect(settled).toMatchObject({ success: false, errorReason: "fake_settle_failed_by_test" });
    expect(facilitator.calls.settle).toBe(1);
    expect(facilitator.settlements).toHaveLength(0);
  });

  it("facilitator unreachable (closed port, real HTTP client) -> error status, no data", async () => {
    // Port 9 (discard) on loopback is closed on a normal dev machine: connection refused.
    const facilitator = createFacilitatorClient({ apiKey: "test-dummy-key", url: "http://127.0.0.1:9", timeoutMs: 2_000 });
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const res = await app.request(DATA_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(await res.text()).not.toContain(FIXTURE_MARKER);
  });

  it("verify times out (real HTTP client, hanging stub) -> 502, no data", async () => {
    const url = await hangingFacilitator();
    const facilitator = createFacilitatorClient({ apiKey: "test-dummy-key", url, timeoutMs: 300 });
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const res = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL) });
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain(FIXTURE_MARKER);
  });

  it("settle times out -> 502, no data (outcome is indeterminate, see settlement guard)", async () => {
    const facilitator = new FakeFacilitatorClient().planSettle("timeout");
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const res = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL) });
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain(FIXTURE_MARKER);
    expect(res.headers.get("payment-response")).toBeNull();
  });
});

describe("retries", () => {
  it("transient verify error, then a retry succeeds -> exactly one settlement", async () => {
    const facilitator = new FakeFacilitatorClient().planVerify("throw");
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const account = newTestAccount();
    const first = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account }) });
    expect(first.status).toBe(402);
    expect(await first.text()).not.toContain(FIXTURE_MARKER);
    const second = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account }) });
    expect(second.status).toBe(200);
    expect(await second.text()).toContain(FIXTURE_MARKER);
    expect(facilitator.calls.settle).toBe(1);
    expect(facilitator.settlements).toHaveLength(1);
  });

  it("transient settle error, then a retry with the same payment id succeeds -> exactly one settlement", async () => {
    const facilitator = new FakeFacilitatorClient().planSettle("throw");
    const { app } = createSellerApp({ facilitator, payTo: PAY_TO });
    const account = newTestAccount();
    const paymentId = "pay_retry_test_000000000001";
    const first = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account, paymentId }) });
    expect(first.status).not.toBe(200);
    expect(await first.text()).not.toContain(FIXTURE_MARKER);
    const second = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL, { account, paymentId }) });
    expect(second.status).toBe(200);
    expect(decodePaymentResponseHeader(second.headers.get("payment-response")!).success).toBe(true);
    expect(facilitator.calls.settle).toBe(2);
    expect(facilitator.settlements).toHaveLength(1);
  });
});
