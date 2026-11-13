/**
 * Seller configuration, validated at startup. Error messages name the variable and the fix,
 * never the value (the API key is a secret; a bad address may be a pasted secret by mistake).
 */
import { getAddress, isAddress, zeroAddress, type Address } from "viem";

export class ConfigError extends Error {
  override name = "ConfigError";
}

export type SellerConfig = { apiKey: string; payTo: Address; port: number };

export function loadConfig(env: Record<string, string | undefined>): SellerConfig {
  const network = env.X402_NETWORK?.trim() || "testnet";
  if (network !== "testnet") {
    throw new ConfigError('X402_NETWORK must be "testnet": spike S0 runs on Celo Sepolia only (no real funds).');
  }
  const apiKey = env.X402_API_KEY?.trim();
  if (!apiKey) {
    throw new ConfigError("X402_API_KEY is missing. Create it at https://x402.celo.org and set it in .env (see README.md).");
  }
  const payToRaw = env.SELLER_PAY_TO?.trim();
  if (!payToRaw) throw new ConfigError("SELLER_PAY_TO is missing: set it to the seller's own receiving address.");
  if (!isAddress(payToRaw, { strict: false })) {
    throw new ConfigError("SELLER_PAY_TO is not a valid EVM address (expected 0x followed by 40 hex characters).");
  }
  const payTo = getAddress(payToRaw);
  if (payTo === zeroAddress) throw new ConfigError("SELLER_PAY_TO must not be the zero address.");
  const portRaw = env.PORT?.trim() || "3000";
  const port = Number(portRaw);
  if (!/^\d+$/.test(portRaw) || port < 1 || port > 65535) throw new ConfigError("PORT must be an integer between 1 and 65535.");
  return { apiKey, payTo, port };
}

/** Load `.env` from the current directory when present; variables already set win. */
export function loadDotEnv(): void {
  try {
    process.loadEnvFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new ConfigError("could not read .env (check its syntax).");
  }
}
