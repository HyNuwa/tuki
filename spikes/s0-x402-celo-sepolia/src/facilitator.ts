/**
 * Real facilitator client for the seller: the hosted Celo Sepolia facilitator, with the metering
 * key sent as `X-API-Key` on verify / settle / supported. The key goes only to the facilitator.
 */
import { HTTPFacilitatorClient } from "@x402/core/server";
import { CELO_SEPOLIA } from "./network.ts";

export type FacilitatorOptions = { apiKey: string; url?: string; timeoutMs?: number };

export function createFacilitatorClient(opts: FacilitatorOptions): HTTPFacilitatorClient {
  return new HTTPFacilitatorClient({
    url: opts.url ?? CELO_SEPOLIA.facilitatorUrl,
    timeoutMs: opts.timeoutMs ?? 30_000,
    createAuthHeaders: async () => {
      const headers = { "X-API-Key": opts.apiKey };
      return { verify: headers, settle: headers, supported: headers };
    },
  });
}
