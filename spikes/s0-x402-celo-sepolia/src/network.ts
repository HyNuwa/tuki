/**
 * Celo Sepolia constants for spike S0. Sources: https://x402.celo.org/SKILL.md (token table,
 * facilitator URL) and Celo network docs (RPC, explorer). Testnet only: this spike never
 * talks to mainnet.
 */
import { getAddress } from "viem";

export const CELO_SEPOLIA = {
  caip2: "eip155:11142220",
  chainId: 11142220,
  label: "Celo Sepolia",
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  facilitatorUrl: "https://api.x402.sepolia.celo.org",
  explorerTxUrl: "https://celo-sepolia.blockscout.com/tx/",
  usdc: {
    address: getAddress("0x01C5C0122039549AD1493B8220cABEdD739BC44E"),
    decimals: 6,
    // EIP-712 domain used by EIP-3009 transferWithAuthorization. Not readable on-chain.
    eip712: { name: "USDC", version: "2" },
  },
} as const;

/** US$0.01 in USDC base units (6 decimals). Always a string. */
export const PRODUCT_PRICE_ATOMIC = "10000";
