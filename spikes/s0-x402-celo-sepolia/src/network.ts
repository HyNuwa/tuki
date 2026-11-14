/**
 * Network registry for spike S0. One network is active at a time, selected by `X402_NETWORK`
 * (see `selectNetwork` in config.ts); Base Sepolia is the default.
 *
 * Sources: `getDefaultAsset` in @x402/evm 2.31.0 (USDC address, EIP-712 name/version, decimals),
 * https://x402.org/facilitator/supported (Base Sepolia, no key), https://x402.celo.org/SKILL.md
 * (Celo Sepolia facilitator, needs X-API-Key), Base and Celo network docs (RPC, explorer).
 * Base mainnet is described for reference only: the spike refuses to select it (no real funds).
 */
import { getAddress, type Address } from "viem";

export type NetworkId = "base-sepolia" | "celo-sepolia" | "base";

export type NetworkConfig = {
  readonly id: NetworkId;
  readonly caip2: `eip155:${number}`;
  readonly chainId: number;
  readonly label: string;
  /** Only testnets can be selected in this spike. */
  readonly testnet: boolean;
  readonly rpcUrl: string;
  readonly facilitatorUrl: string;
  /** Present when the facilitator meters calls with an `X-API-Key`; null when it takes no key. */
  readonly facilitatorApiKey: { readonly env: "X402_API_KEY"; readonly helpUrl: string } | null;
  readonly explorerTxUrl: string;
  readonly faucetUrl: string | null;
  readonly usdc: {
    readonly address: Address;
    readonly decimals: number;
    /** EIP-712 domain used by EIP-3009 transferWithAuthorization. Not readable on-chain. */
    readonly eip712: { readonly name: string; readonly version: string };
  };
};

export const BASE_SEPOLIA: NetworkConfig = {
  id: "base-sepolia",
  caip2: "eip155:84532",
  chainId: 84532,
  label: "Base Sepolia",
  testnet: true,
  rpcUrl: "https://sepolia.base.org",
  facilitatorUrl: "https://x402.org/facilitator",
  facilitatorApiKey: null,
  explorerTxUrl: "https://sepolia.basescan.org/tx/",
  faucetUrl: "https://faucet.circle.com/",
  usdc: { address: getAddress("0x036CbD53842c5426634e7929541eC2318f3dCF7e"), decimals: 6, eip712: { name: "USDC", version: "2" } },
};

export const CELO_SEPOLIA: NetworkConfig = {
  id: "celo-sepolia",
  caip2: "eip155:11142220",
  chainId: 11142220,
  label: "Celo Sepolia",
  testnet: true,
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  facilitatorUrl: "https://api.x402.sepolia.celo.org",
  facilitatorApiKey: { env: "X402_API_KEY", helpUrl: "https://x402.celo.org" },
  explorerTxUrl: "https://celo-sepolia.blockscout.com/tx/",
  faucetUrl: "https://faucet.circle.com/",
  usdc: { address: getAddress("0x01C5C0122039549AD1493B8220cABEdD739BC44E"), decimals: 6, eip712: { name: "USDC", version: "2" } },
};

/**
 * Base mainnet, reference only (pilot). Never selectable here. Its production facilitator (CDP)
 * authenticates with a CDP API key ID and secret, which this spike does not implement.
 */
export const BASE: NetworkConfig = {
  id: "base",
  caip2: "eip155:8453",
  chainId: 8453,
  label: "Base",
  testnet: false,
  rpcUrl: "https://mainnet.base.org",
  facilitatorUrl: "https://api.cdp.coinbase.com/platform/v2/x402",
  facilitatorApiKey: null,
  explorerTxUrl: "https://basescan.org/tx/",
  faucetUrl: null,
  usdc: { address: getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"), decimals: 6, eip712: { name: "USD Coin", version: "2" } },
};

export const NETWORKS: Readonly<Record<NetworkId, NetworkConfig>> = {
  "base-sepolia": BASE_SEPOLIA,
  "celo-sepolia": CELO_SEPOLIA,
  base: BASE,
};

export const DEFAULT_NETWORK_ID: NetworkId = "base-sepolia";
export const DEFAULT_NETWORK: NetworkConfig = NETWORKS[DEFAULT_NETWORK_ID];

export function isNetworkId(value: string): value is NetworkId {
  return Object.prototype.hasOwnProperty.call(NETWORKS, value);
}

/** US$0.01 in USDC base units (6 decimals). Always a string. */
export const PRODUCT_PRICE_ATOMIC = "10000";

/** Explicit x402 price object, never "$0.01": the asset and its EIP-712 domain are named here. */
export function priceFor(network: NetworkConfig, amountAtomic: string) {
  return { amount: amountAtomic, asset: network.usdc.address, extra: { ...network.usdc.eip712 } };
}
