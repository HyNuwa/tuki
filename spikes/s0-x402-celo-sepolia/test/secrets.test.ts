/**
 * The API key goes only to a facilitator that needs it (Celo Sepolia, as X-API-Key) and never
 * shows up in seller responses or logs. The x402.org facilitator (Base Sepolia) never receives
 * it. Uses the REAL HTTPFacilitatorClient against a local stub (a FAKE facilitator over HTTP).
 */
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createFacilitatorClient } from "../src/facilitator.ts";
import { BASE_SEPOLIA, CELO_SEPOLIA, type NetworkConfig } from "../src/network.ts";
import { createSellerApp } from "../src/seller.ts";
import { newTestAccount, signPaymentHeader } from "./buyer-helpers.ts";

const SENTINEL_KEY = "x402_TEST_SENTINEL_never_print_me_0123456789";
const DATA_URL = "http://seller.test/v1/products/dp_test_fixture_milk_noa/data";
const seen: Array<{ path: string; headers: IncomingHttpHeaders }> = [];
let stub: Server;
let stubUrl: string;
let settleSucceeds = true;
let stubNetwork: NetworkConfig = BASE_SEPOLIA;

beforeAll(async () => {
  stub = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ path: req.url ?? "", headers: req.headers });
      res.setHeader("content-type", "application/json");
      const payer = body ? JSON.parse(body).paymentPayload?.payload?.authorization?.from : undefined;
      const network = stubNetwork.caip2;
      if (req.url === "/supported") {
        res.end(JSON.stringify({ kinds: [{ x402Version: 2, scheme: "exact", network }], extensions: [], signers: {} }));
      } else if (req.url === "/verify") {
        res.end(JSON.stringify({ isValid: true, payer }));
      } else if (req.url === "/settle") {
        res.end(
          JSON.stringify(
            settleSucceeds
              ? { success: true, transaction: `0x${"ab".repeat(32)}`, network, payer }
              : { success: false, errorReason: "fake_stub_failure", transaction: "", network, payer },
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
beforeEach(() => void seen.splice(0));

async function dump(res: Response): Promise<string> {
  return `${res.status} ${JSON.stringify([...res.headers.entries()])} ${await res.text()}`;
}

/** Discovery, an unpaid 402, a paid 200 and a failed settle through the seller, capturing logs. */
async function exercise(network: NetworkConfig) {
  stubNetwork = network;
  const logs: string[] = [];
  const capture = (...args: unknown[]) => void logs.push(args.map(String).join(" "));
  const spies = (["log", "error", "warn", "info", "debug"] as const).map((m) => vi.spyOn(console, m).mockImplementation(capture));
  try {
    const facilitator = createFacilitatorClient({ network, apiKey: SENTINEL_KEY, url: stubUrl, timeoutMs: 5_000 });
    const { app } = createSellerApp({ facilitator, payTo: newTestAccount().address, network });
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
    return { outputs: outputs.join("\n"), logs: logs.join("\n") };
  } finally {
    spies.forEach((s) => s.mockRestore());
  }
}

describe("secrets", () => {
  it("Celo Sepolia: sends X-API-Key to supported/verify/settle and never leaks it in responses or logs", async () => {
    const { outputs, logs } = await exercise(CELO_SEPOLIA);
    for (const path of ["/supported", "/verify", "/settle"]) {
      expect(seen.find((s) => s.path === path)?.headers["x-api-key"]).toBe(SENTINEL_KEY);
    }
    expect(outputs).not.toContain(SENTINEL_KEY);
    expect(logs).not.toContain(SENTINEL_KEY);
  });

  it("Base Sepolia: never sends X-API-Key to the facilitator, even when a key is passed", async () => {
    const { outputs, logs } = await exercise(BASE_SEPOLIA);
    for (const path of ["/supported", "/verify", "/settle"]) {
      const hit = seen.find((s) => s.path === path);
      expect(hit).toBeDefined();
      expect(hit!.headers).not.toHaveProperty("x-api-key");
    }
    expect(JSON.stringify(seen)).not.toContain(SENTINEL_KEY);
    expect(outputs).not.toContain(SENTINEL_KEY);
    expect(logs).not.toContain(SENTINEL_KEY);
  });
});
