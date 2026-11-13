/**
 * `npm run agent`: the buyer "agent" (simple automatic client, no LLM) against the seller from
 * `npm run server`, paying on Celo Sepolia. Reads BUYER_PRIVATE_KEY from .env; never prints it.
 */
import { createPublicClient, erc20Abi, http, isHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { FIXTURE_PRODUCT } from "./catalog.ts";
import { ConfigError, loadDotEnv } from "./config.ts";
import { CELO_SEPOLIA } from "./network.ts";
import { runAgent } from "./buyer.ts";

function fail(message: string): never {
  console.error(`agent: ${message}`);
  process.exit(1);
}

try {
  loadDotEnv();
} catch (error) {
  fail(error instanceof ConfigError ? error.message : "could not load .env");
}
const raw = process.env.BUYER_PRIVATE_KEY?.trim();
if (!raw) fail("BUYER_PRIVATE_KEY is missing. Run `npm run wallet:new` (writes it to the gitignored .env).");
const key = raw.startsWith("0x") ? raw : `0x${raw}`;
if (!isHex(key) || key.length !== 66) fail("BUYER_PRIVATE_KEY is not a 32-byte hex key.");
const account = privateKeyToAccount(key);

const baseUrl = process.env.SELLER_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
const budgetAtomic = process.env.AGENT_BUDGET_ATOMIC ?? FIXTURE_PRODUCT.price.amountAtomic;
const wantZone = process.env.AGENT_ZONE ?? FIXTURE_PRODUCT.coverage.zones[0]!;

try {
  const rpc = createPublicClient({ transport: http(CELO_SEPOLIA.rpcUrl, { timeout: 15_000 }) });
  const balance = await rpc.readContract({ address: CELO_SEPOLIA.usdc.address, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  console.log(`buyer USDC balance on ${CELO_SEPOLIA.label}: ${balance} atomic`);
} catch {
  console.log("buyer USDC balance: unavailable (RPC error); continuing");
}

try {
  const result = await runAgent({ baseUrl, account, budgetAtomic, wantZone, log: (l) => console.log(l) });
  if (result.kind !== "paid" || result.status !== 200 || !result.settlement?.success) process.exitCode = 1;
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
