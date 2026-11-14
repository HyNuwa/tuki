/**
 * Compatibility check for the selected network (`X402_NETWORK`, default Base Sepolia).
 * Needs no key and moves no funds.
 *  1. GET /supported on the network's real facilitator: x402 v2 `exact` on its CAIP-2. When the
 *     facilitator lists `supportedAssets` (Celo does, x402.org does not) the USDC entry must match
 *     our address, EIP-712 name/version and decimals; when it does not list them, that is reported.
 *  2. Reads the USDC contract through the network's public RPC: chainId, decimals(), name().
 *  3. getDefaultAsset(caip2) from the installed @x402/evm must match our registry entry.
 *  4. Records the installed package versions and whether the facilitator lists
 *     `payment-identifier` (informational: our idempotency is resource-server side, see REPORT §12).
 * Prints one compact JSON object and exits 1 if any check fails.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createPublicClient, erc20Abi, http, isAddressEqual } from "viem";
import { getDefaultAsset } from "@x402/evm";
import { ConfigError, loadDotEnv, selectNetwork } from "./config.ts";
import type { NetworkConfig } from "./network.ts";

type SupportedAsset = { asset: string; symbol?: string; decimals?: number; name?: string; version?: string; assetTransferMethod?: string };
type SupportedKind = { x402Version: number; scheme: string; network: string; extra?: { extensions?: string[]; supportedAssets?: SupportedAsset[] } };

const require = createRequire(import.meta.url);

function installedVersion(pkg: string): string {
  // Resolve the package's own package.json through node_modules (exports may hide it).
  const entry = require.resolve(pkg);
  const sep = entry.includes("\\") ? "\\" : "/";
  const marker = `node_modules${sep}${pkg.split("/").join(sep)}`;
  const root = entry.slice(0, entry.indexOf(marker) + marker.length);
  return (JSON.parse(readFileSync(`${root}/package.json`, "utf8")) as { version: string }).version;
}

async function checkFacilitator(network: NetworkConfig) {
  // No auth header: /supported is checked keyless on every network.
  const res = await fetch(`${network.facilitatorUrl}/supported`, { signal: AbortSignal.timeout(20_000) });
  const body = (await res.json()) as { kinds?: SupportedKind[]; extensions?: string[] };
  const kind = body.kinds?.find((k) => k.x402Version === 2 && k.scheme === "exact" && k.network === network.caip2);
  const listed = kind?.extra?.supportedAssets;
  const usdc = listed?.find((a) => isAddressEqual(a.asset as `0x${string}`, network.usdc.address)) ?? null;
  const assetOk =
    listed === undefined ||
    (!!usdc && usdc.name === network.usdc.eip712.name && usdc.version === network.usdc.eip712.version && usdc.decimals === network.usdc.decimals);
  const extensions = kind?.extra?.extensions ?? body.extensions ?? [];
  return {
    ok: res.status === 200 && !!kind && assetOk,
    url: network.facilitatorUrl,
    status: res.status,
    exactV2: !!kind,
    supportedAssets: listed === undefined ? "not listed by facilitator" : listed.length,
    usdc,
    extensions,
    paymentIdentifierListed: extensions.includes("payment-identifier"),
  };
}

async function checkToken(network: NetworkConfig) {
  const client = createPublicClient({ transport: http(network.rpcUrl, { timeout: 20_000 }) });
  const [chainId, decimals, name, symbol] = await Promise.all([
    client.getChainId(),
    client.readContract({ address: network.usdc.address, abi: erc20Abi, functionName: "decimals" }),
    client.readContract({ address: network.usdc.address, abi: erc20Abi, functionName: "name" }),
    client.readContract({ address: network.usdc.address, abi: erc20Abi, functionName: "symbol" }),
  ]);
  const ok = chainId === network.chainId && decimals === network.usdc.decimals;
  // name() is the token name; the EIP-712 domain name is not readable on-chain and can differ.
  return { ok, rpc: network.rpcUrl, chainId, address: network.usdc.address, decimals, name, symbol, eip712: network.usdc.eip712 };
}

function checkSdkDefaultAsset(network: NetworkConfig) {
  const asset = getDefaultAsset(network.caip2);
  const ok =
    !!asset &&
    isAddressEqual(asset.asset as `0x${string}`, network.usdc.address) &&
    asset.decimals === network.usdc.decimals &&
    asset.name === network.usdc.eip712.name &&
    asset.version === network.usdc.eip712.version;
  return { ok, asset: asset ?? null };
}

async function settle<T>(fn: () => Promise<T> | T): Promise<T | { ok: false; error: string }> {
  try {
    return await fn();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message.split("\n")[0]! : String(error) };
  }
}

let network: NetworkConfig;
try {
  loadDotEnv();
  network = selectNetwork(process.env);
} catch (error) {
  console.error(`check:compat: ${error instanceof ConfigError ? error.message : "could not load .env"}`);
  process.exit(1);
}

const packages = ["@x402/core", "@x402/evm", "@x402/fetch", "@x402/hono", "@x402/extensions", "viem", "hono", "@hono/node-server"];
const result = {
  checkedAt: new Date().toISOString(),
  network: { id: network.id, caip2: network.caip2, label: network.label },
  node: process.version,
  versions: Object.fromEntries(packages.map((p) => [p, installedVersion(p)])),
  facilitator: await settle(() => checkFacilitator(network)),
  token: await settle(() => checkToken(network)),
  sdkDefaultAsset: await settle(() => checkSdkDefaultAsset(network)),
};
const ok = result.facilitator.ok && result.token.ok && result.sdkDefaultAsset.ok;
console.log(JSON.stringify({ ok, ...result }, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
if (!ok) process.exitCode = 1;
