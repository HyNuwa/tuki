/**
 * Seller entrypoint: `npm run server`. Reads .env, validates config (fails fast), serves the app
 * against the REAL hosted Celo Sepolia facilitator. Never prints the API key.
 */
import { serve } from "@hono/node-server";
import { ConfigError, loadConfig, loadDotEnv } from "./config.ts";
import { createFacilitatorClient } from "./facilitator.ts";
import { CELO_SEPOLIA } from "./network.ts";
import { createSellerApp } from "./seller.ts";

function start() {
  try {
    loadDotEnv();
    return loadConfig(process.env);
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(`config error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

const config = start();
const facilitator = createFacilitatorClient({ apiKey: config.apiKey });
const { app } = createSellerApp({ facilitator, payTo: config.payTo });
serve({ fetch: app.fetch, port: config.port });
console.log(
  `seller listening on http://localhost:${config.port} network=${CELO_SEPOLIA.label} (${CELO_SEPOLIA.caip2}) ` +
    `facilitator=${CELO_SEPOLIA.facilitatorUrl} payTo=${config.payTo} X402_API_KEY=set`,
);
