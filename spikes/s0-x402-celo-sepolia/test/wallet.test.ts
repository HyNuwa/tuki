/**
 * `wallet:new` writes a throwaway key only to .env, prints only the address and refuses to
 * overwrite. Runs in an empty temp directory (not a git repo), never in the spike folder.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";

const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const entry = resolve(import.meta.dirname, "../src/wallet-new.ts");
const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

function run(cwd: string) {
  return spawnSync(process.execPath, [tsxCli, entry], { cwd, encoding: "utf8", timeout: 30_000 });
}

describe("wallet:new", () => {
  it("writes BUYER_PRIVATE_KEY to .env and prints only the matching address", () => {
    const dir = mkdtempSync(join(tmpdir(), "s0-wallet-"));
    dirs.push(dir);
    writeFileSync(join(dir, ".env"), "X402_NETWORK=testnet\nBUYER_PRIVATE_KEY=\n");
    const out = run(dir);
    expect(out.status).toBe(0);
    const env = readFileSync(join(dir, ".env"), "utf8");
    const key = /^BUYER_PRIVATE_KEY=(0x[0-9a-f]{64})$/m.exec(env)?.[1] as `0x${string}`;
    expect(key).toBeTruthy();
    expect(env).toContain("X402_NETWORK=testnet");
    expect(out.stdout).toContain(privateKeyToAccount(key).address);
    expect(out.stdout + out.stderr).not.toContain(key.slice(2));
  });

  it("refuses to overwrite an existing key", () => {
    const dir = mkdtempSync(join(tmpdir(), "s0-wallet-"));
    dirs.push(dir);
    const before = `BUYER_PRIVATE_KEY=0x${"11".repeat(32)}\n`;
    writeFileSync(join(dir, ".env"), before);
    const out = run(dir);
    expect(out.status).toBe(1);
    expect(out.stderr).toContain("refusing to overwrite");
    expect(out.stdout + out.stderr).not.toContain("11".repeat(32));
    expect(readFileSync(join(dir, ".env"), "utf8")).toBe(before);
  });
});
