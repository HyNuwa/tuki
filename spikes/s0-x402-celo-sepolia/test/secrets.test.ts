/**
 * The API key goes only to the facilitator (as X-API-Key) and never shows up in seller responses
 * or logs. Uses the REAL HTTPFacilitatorClient against a local stub (a FAKE facilitator over HTTP).
 */
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createFacilitatorClient } from "../src/facilitator.ts";
import { createSellerApp } from "../src/seller.ts";
import { newTestAccount, signPaymentHeader } from "./buyer-helpers.ts";

const SENTINEL_KEY = "x402_TEST_SENTINEL_never_print_me_0123456789";
const DATA_URL = "http://seller.test/v1/products/dp_test_fixture_milk_noa/data";
const seen: Array<{ path: string; headers: IncomingHttpHeaders }> = [];
let stub: Server;
let stubUrl: string;
let settleSucceeds = true;

beforeAll(async () => {
  stub = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ path: req.url ?? "", headers: req.headers });
      res.setHeader("content-type", "application/json");
      const payer = body ? JSON.parse(body).paymentPayload?.payload?.authorization?.from : undefined;
      if (req.url === "/supported") {
        res.end(JSON.stringify({ kinds: [{ x402Version: 2, scheme: "exact", network: "eip155:11142220" }], extensions: [], signers: {} }));
      } else if (req.url === "/verify") {
        res.end(JSON.stringify({ isValid: true, payer }));
      } else if (req.url === "/settle") {
        res.end(
          JSON.stringify(
            settleSucceeds
              ? { success: true, transaction: `0x${"ab".repeat(32)}`, network: "eip155:11142220", payer }
              : { success: false, errorReason: "fake_stub_failure", transaction: "", network: "eip155:11142220", payer },
          ),
        );
      } else {
        res.statusCode = 404;
        res.end("{}");
      }
    });
  });
  await new Promise<void>((r) => stub.listen(0, "127.0.0.1", r));
  stubUrl = `http://127.0.0.1:${(stub.address() as AddressInfo).port}`;
});
afterAll(() => new Promise((r) => stub.close(r)));

async function dump(res: Response): Promise<string> {
  return `${res.status} ${JSON.stringify([...res.headers.entries()])} ${await res.text()}`;
}

describe("secrets", () => {
  it("sends X-API-Key to supported/verify/settle and never leaks it in responses or logs", async () => {
    const logs: string[] = [];
    const capture = (...args: unknown[]) => void logs.push(args.map(String).join(" "));
    const spies = (["log", "error", "warn", "info", "debug"] as const).map((m) => vi.spyOn(console, m).mockImplementation(capture));
    try {
      const facilitator = createFacilitatorClient({ apiKey: SENTINEL_KEY, url: stubUrl, timeoutMs: 5_000 });
      const { app } = createSellerApp({ facilitator, payTo: newTestAccount().address });
      const outputs: string[] = [];
      outputs.push(await dump(await app.request("http://seller.test/v1/products")));
      outputs.push(await dump(await app.request(DATA_URL)));
      settleSucceeds = true;
      const ok = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL) });
      expect(ok.status).toBe(200);
      outputs.push(await dump(ok));
      settleSucceeds = false;
      const failed = await app.request(DATA_URL, { headers: await signPaymentHeader(app, DATA_URL) });
      expect(failed.status).toBe(402);
      outputs.push(await dump(failed));

      for (const path of ["/supported", "/verify", "/settle"]) {
        expect(seen.find((s) => s.path === path)?.headers["x-api-key"]).toBe(SENTINEL_KEY);
      }
      expect(outputs.join("\n")).not.toContain(SENTINEL_KEY);
      expect(logs.join("\n")).not.toContain(SENTINEL_KEY);
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
  });
});
