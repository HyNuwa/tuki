/**
 * Seller configuration, validated at startup. Error messages name the variable and the fix,
 * never the value (the API key is a secret; a bad address may be a pasted secret by mistake).
 */
import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import { DEFAULT_NETWORK_ID, NETWORKS, isNetworkId, type NetworkConfig } from "./network.ts";

export class ConfigError extends Error {
  override name = "ConfigError";
}

export type SellerConfig = {
  network: NetworkConfig;
  /** Only set when the selected network's facilitator needs `X-API-Key`. */
  apiKey: string | undefined;
  payTo: Address;
  port: number;
};

const SELECTABLE = Object.values(NETWORKS)
  .filter((n) => n.testnet)
  .map((n) => `"${n.id}"`)
  .join(", ");

/** The active network from `X402_NETWORK` (default `base-sepolia`). Testnets only. */
export function selectNetwork(env: Record<string, string | undefined>): NetworkConfig {
  const id = env.X402_NETWORK?.trim() || DEFAULT_NETWORK_ID;
  if (id === "testnet") {
    throw new ConfigError(`X402_NETWORK="testnet" is no longer accepted: set it to one of ${SELECTABLE} (default "${DEFAULT_NETWORK_ID}").`);
  }
  if (!isNetworkId(id)) throw new ConfigError(`X402_NETWORK must be one of ${SELECTABLE} (default "${DEFAULT_NETWORK_ID}").`);
  const network = NETWORKS[id];
  if (!network.testnet) {
    throw new ConfigError(`X402_NETWORK="${id}" is mainnet: spike S0 runs on testnets only (${SELECTABLE}); no real funds.`);
  }
  return network;
}

export function loadConfig(env: Record<string, string | undefined>): SellerConfig {
  const network = selectNetwork(env);
  let apiKey: string | undefined;
  if (network.facilitatorApiKey) {
    apiKey = env[network.facilitatorApiKey.env]?.trim();
    if (!apiKey) {
      throw new ConfigError(
        `${network.facilitatorApiKey.env} is missing: the ${network.label} facilitator needs it. ` +
          `Create it at ${network.facilitatorApiKey.helpUrl} and set it in .env (see README.md).`,
      );
    }
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
  return { network, apiKey, payTo, port };
}

/** Load `.env` from the current directory when present; variables already set win. */
export function loadDotEnv(): void {
  try {
    process.loadEnvFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new ConfigError("could not read .env (check its syntax).");
  }
}
