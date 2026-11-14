/**
 * Startup configuration fails fast with a clear message and never echoes secrets.
 * The server entrypoint is spawned in an empty temp directory, so no local .env is read and
 * nothing listens or reaches the network when config is invalid.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "../src/config.ts";
import { BASE_SEPOLIA, CELO_SEPOLIA } from "../src/network.ts";

const SENTINEL_KEY = "x402_TEST_SENTINEL_never_print_me_0123456789";
const VALID_PAY_TO = "0x1111111111111111111111111111111111111111";
const CELO = "celo-sepolia";
const scratch = mkdtempSync(join(tmpdir(), "s0-config-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const serverEntry = resolve(import.meta.dirname, "../src/server.ts");

function startServer(env: Record<string, string>) {
  const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) => !["X402_API_KEY", "SELLER_PAY_TO", "X402_NETWORK", "BUYER_PRIVATE_KEY"].includes(k)));
  return spawnSync(process.execPath, [tsxCli, serverEntry], { cwd: scratch, env: { ...clean, ...env }, encoding: "utf8", timeout: 30_000 });
}

describe("loadConfig", () => {
  it("defaults to Base Sepolia, needs no X402_API_KEY there and defaults the port to 3000", () => {
    expect(loadConfig({ SELLER_PAY_TO: VALID_PAY_TO })).toEqual({ network: BASE_SEPOLIA, apiKey: undefined, payTo: VALID_PAY_TO, port: 3000 });
  });

  it("ignores X402_API_KEY on Base Sepolia (the x402.org facilitator takes no key)", () => {
    expect(loadConfig({ X402_API_KEY: SENTINEL_KEY, SELLER_PAY_TO: VALID_PAY_TO }).apiKey).toBeUndefined();
  });

  it("accepts a Celo Sepolia config with its API key", () => {
    expect(loadConfig({ X402_API_KEY: SENTINEL_KEY, SELLER_PAY_TO: VALID_PAY_TO, X402_NETWORK: CELO, PORT: "4010" })).toEqual({
      network: CELO_SEPOLIA,
      apiKey: SENTINEL_KEY,
      payTo: VALID_PAY_TO,
      port: 4010,
    });
  });

  it.each([
    [{ SELLER_PAY_TO: VALID_PAY_TO, X402_NETWORK: CELO }, /X402_API_KEY is missing.*Celo Sepolia/],
    [{ X402_API_KEY: "  ", SELLER_PAY_TO: VALID_PAY_TO, X402_NETWORK: CELO }, /X402_API_KEY is missing/],
    [{ X402_API_KEY: SENTINEL_KEY }, /SELLER_PAY_TO is missing/],
    [{ SELLER_PAY_TO: "0xnot-an-address" }, /SELLER_PAY_TO is not a valid EVM address/],
    [{ SELLER_PAY_TO: "0x0000000000000000000000000000000000000000" }, /SELLER_PAY_TO must not be the zero address/],
    [{ X402_API_KEY: SENTINEL_KEY, SELLER_PAY_TO: VALID_PAY_TO, X402_NETWORK: "base" }, /testnets only/],
    [{ X402_API_KEY: SENTINEL_KEY, SELLER_PAY_TO: VALID_PAY_TO, X402_NETWORK: "mainnet" }, /X402_NETWORK must be one of/],
    [{ X402_API_KEY: SENTINEL_KEY, SELLER_PAY_TO: VALID_PAY_TO, PORT: "abc" }, /PORT must be an integer/],
  ])("rejects %j", (env, message) => {
    expect(() => loadConfig(env)).toThrow(ConfigError);
    expect(() => loadConfig(env)).toThrow(message);
    try {
      loadConfig(env);
    } catch (error) {
      expect(String((error as Error).message)).not.toContain(SENTINEL_KEY);
      expect(String((error as Error).message)).not.toContain("0xnot-an-address");
    }
  });
});

describe("server startup", () => {
  it("exits 1 with a clear message when X402_API_KEY is missing on Celo Sepolia", () => {
    const run = startServer({ SELLER_PAY_TO: VALID_PAY_TO, X402_NETWORK: CELO });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("X402_API_KEY is missing");
  });

  it("exits 1 on an invalid SELLER_PAY_TO without echoing the API key or the bad value", () => {
    const run = startServer({ X402_API_KEY: SENTINEL_KEY, SELLER_PAY_TO: "0xdeadbeef", X402_NETWORK: CELO });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("SELLER_PAY_TO is not a valid EVM address");
    expect(run.stdout + run.stderr).not.toContain(SENTINEL_KEY);
    expect(run.stdout + run.stderr).not.toContain("0xdeadbeef");
  });

  it("on the default network fails only on SELLER_PAY_TO, never on a missing X402_API_KEY", () => {
    const run = startServer({});
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("SELLER_PAY_TO is missing");
    expect(run.stderr).not.toContain("X402_API_KEY");
  });
});
