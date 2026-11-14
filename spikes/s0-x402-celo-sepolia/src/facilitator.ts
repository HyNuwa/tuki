/**
 * Real facilitator client for the seller, for the selected network. When that network's
 * facilitator meters calls (Celo Sepolia), the key is sent as `X-API-Key` on verify / settle /
 * supported and goes only to the facilitator. When it takes no key (x402.org on Base Sepolia),
 * no auth header is sent at all, even if a key was passed.
 */
import { HTTPFacilitatorClient } from "@x402/core/server";
import { DEFAULT_NETWORK, type NetworkConfig } from "./network.ts";

export type FacilitatorOptions = { network?: NetworkConfig; apiKey?: string; url?: string; timeoutMs?: number };

export function createFacilitatorClient(opts: FacilitatorOptions = {}): HTTPFacilitatorClient {
  const network = opts.network ?? DEFAULT_NETWORK;
  const apiKey = network.facilitatorApiKey ? opts.apiKey : undefined;
  return new HTTPFacilitatorClient({
    url: opts.url ?? network.facilitatorUrl,
    timeoutMs: opts.timeoutMs ?? 30_000,
    ...(apiKey && {
      createAuthHeaders: async () => {
        const headers = { "X-API-Key": apiKey };
        return { verify: headers, settle: headers, supported: headers };
      },
    }),
  });
}
