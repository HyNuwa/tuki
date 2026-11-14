/**
 * `npm run agent`: the buyer "agent" (simple automatic client, no LLM) against the seller from
 * `npm run server`, paying on the selected network (`X402_NETWORK`, default Base Sepolia).
 * Reads BUYER_PRIVATE_KEY from .env; never prints it.
 */
import { createPublicClient, erc20Abi, http, isHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { fixtureProduct } from "./catalog.ts";
import { ConfigError, loadDotEnv, selectNetwork } from "./config.ts";
import type { NetworkConfig } from "./network.ts";
import { runAgent } from "./buyer.ts";

function fail(message: string): never {
  console.error(`agent: ${message}`);
  process.exit(1);
}

let network: NetworkConfig;
try {
  loadDotEnv();
  network = selectNetwork(process.env);
} catch (error) {
  fail(error instanceof ConfigError ? error.message : "could not load .env");
}
const product = fixtureProduct(network);
const raw = process.env.BUYER_PRIVATE_KEY?.trim();
if (!raw) fail("BUYER_PRIVATE_KEY is missing. Run `npm run wallet:new` (writes it to the gitignored .env).");
const key = raw.startsWith("0x") ? raw : `0x${raw}`;
if (!isHex(key) || key.length !== 66) fail("BUYER_PRIVATE_KEY is not a 32-byte hex key.");
const account = privateKeyToAccount(key);

const baseUrl = process.env.SELLER_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
const budgetAtomic = process.env.AGENT_BUDGET_ATOMIC ?? product.price.amountAtomic;
const wantZone = process.env.AGENT_ZONE ?? product.coverage.zones[0]!;

try {
  const rpc = createPublicClient({ transport: http(network.rpcUrl, { timeout: 15_000 }) });
  const balance = await rpc.readContract({ address: network.usdc.address, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  console.log(`buyer USDC balance on ${network.label}: ${balance} atomic`);
} catch {
  console.log("buyer USDC balance: unavailable (RPC error); continuing");
}

try {
  const result = await runAgent({ baseUrl, account, budgetAtomic, wantZone, network, log: (l) => console.log(l) });
  if (result.kind !== "paid" || result.status !== 200 || !result.settlement?.success) process.exitCode = 1;
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
