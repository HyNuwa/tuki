/**
 * S1 compatibility check. Needs no key and moves no funds.
 *  1. GET /supported on the testnet facilitator: exact + eip155:11142220 + USDC (name/version).
 *  2. Reads the USDC contract on Celo Sepolia through the public RPC: decimals() and name().
 *  3. getDefaultAsset("eip155:11142220") from the installed @x402/evm.
 *  4. Records the installed package versions.
 * Prints one compact JSON object and exits 1 if any check fails.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createPublicClient, erc20Abi, http, isAddressEqual } from "viem";
import { getDefaultAsset } from "@x402/evm";
import { CELO_SEPOLIA } from "./network.ts";

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

async function checkFacilitator() {
  const res = await fetch(`${CELO_SEPOLIA.facilitatorUrl}/supported`, { signal: AbortSignal.timeout(20_000) });
  const body = (await res.json()) as { kinds?: SupportedKind[]; extensions?: string[] };
  const kind = body.kinds?.find((k) => k.x402Version === 2 && k.scheme === "exact" && k.network === CELO_SEPOLIA.caip2);
  const usdc = kind?.extra?.supportedAssets?.find((a) => isAddressEqual(a.asset as `0x${string}`, CELO_SEPOLIA.usdc.address));
  const ok =
    res.status === 200 &&
    !!usdc &&
    usdc.name === CELO_SEPOLIA.usdc.eip712.name &&
    usdc.version === CELO_SEPOLIA.usdc.eip712.version &&
    usdc.decimals === CELO_SEPOLIA.usdc.decimals;
  return { ok, status: res.status, exactOnCeloSepolia: !!kind, usdc: usdc ?? null, extensions: kind?.extra?.extensions ?? body.extensions ?? [] };
}

async function checkToken() {
  const client = createPublicClient({ transport: http(CELO_SEPOLIA.rpcUrl, { timeout: 20_000 }) });
  const [chainId, decimals, name, symbol] = await Promise.all([
    client.getChainId(),
    client.readContract({ address: CELO_SEPOLIA.usdc.address, abi: erc20Abi, functionName: "decimals" }),
    client.readContract({ address: CELO_SEPOLIA.usdc.address, abi: erc20Abi, functionName: "name" }),
    client.readContract({ address: CELO_SEPOLIA.usdc.address, abi: erc20Abi, functionName: "symbol" }),
  ]);
  const ok = chainId === CELO_SEPOLIA.chainId && decimals === CELO_SEPOLIA.usdc.decimals;
  return { ok, rpc: CELO_SEPOLIA.rpcUrl, chainId, address: CELO_SEPOLIA.usdc.address, decimals, name, symbol };
}

function checkSdkDefaultAsset() {
  const asset = getDefaultAsset(CELO_SEPOLIA.caip2);
  const ok =
    !!asset &&
    isAddressEqual(asset.asset as `0x${string}`, CELO_SEPOLIA.usdc.address) &&
    asset.decimals === CELO_SEPOLIA.usdc.decimals &&
    asset.name === CELO_SEPOLIA.usdc.eip712.name &&
    asset.version === CELO_SEPOLIA.usdc.eip712.version;
  return { ok, asset: asset ?? null };
}

async function settle<T>(fn: () => Promise<T> | T): Promise<T | { ok: false; error: string }> {
  try {
    return await fn();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message.split("\n")[0]! : String(error) };
  }
}

const packages = ["@x402/core", "@x402/evm", "@x402/fetch", "@x402/hono", "@x402/extensions", "viem", "hono", "@hono/node-server"];
const result = {
  checkedAt: new Date().toISOString(),
  node: process.version,
  versions: Object.fromEntries(packages.map((p) => [p, installedVersion(p)])),
  facilitator: await settle(checkFacilitator),
  token: await settle(checkToken),
  sdkDefaultAsset: await settle(checkSdkDefaultAsset),
};
const ok = result.facilitator.ok && result.token.ok && result.sdkDefaultAsset.ok;
console.log(JSON.stringify({ ok, ...result }, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
if (!ok) process.exitCode = 1;
