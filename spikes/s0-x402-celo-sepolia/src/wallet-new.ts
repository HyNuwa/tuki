/**
 * `npm run wallet:new`: create a THROWAWAY testnet buyer key (the same EVM key works on Base
 * Sepolia and Celo Sepolia) and store it only in ./.env
 * (gitignored). Prints the address only. Refuses to overwrite an existing BUYER_PRIVATE_KEY and
 * refuses to write when .env is not ignored by git.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ENV_FILE = ".env";

function insideGitWorkTree(): boolean {
  try {
    return execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() === "true";
  } catch {
    return false;
  }
}

function gitIgnores(path: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function fail(message: string): never {
  console.error(`wallet:new: ${message}`);
  process.exit(1);
}

if (insideGitWorkTree() && !gitIgnores(ENV_FILE)) fail(".env is not gitignored here; refusing to write a private key.");

const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : existsSync(".env.example") ? readFileSync(".env.example", "utf8") : "";
const existing = /^BUYER_PRIVATE_KEY=(.*)$/m.exec(current);
if (existing && existing[1]!.trim() !== "") fail("BUYER_PRIVATE_KEY is already set in .env; refusing to overwrite it.");

const privateKey = generatePrivateKey();
const line = `BUYER_PRIVATE_KEY=${privateKey}`;
const next = existing ? current.replace(/^BUYER_PRIVATE_KEY=.*$/m, line) : `${current}${current && !current.endsWith("\n") ? "\n" : ""}${line}\n`;
writeFileSync(ENV_FILE, next, { mode: 0o600 });
console.log(`buyer address: ${privateKeyToAccount(privateKey).address}`);
console.log("private key written to .env (gitignored); it was not printed. Fund the address with testnet USDC at https://faucet.circle.com/ (Base Sepolia by default; Celo Sepolia if X402_NETWORK=celo-sepolia).");
