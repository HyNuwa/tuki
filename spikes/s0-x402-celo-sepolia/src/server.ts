/**
 * Seller entrypoint: `npm run server`. Reads .env, validates config (fails fast), serves the app
 * against the REAL hosted facilitator of the selected network (`X402_NETWORK`, default Base Sepolia).
 * Never prints the API key.
 */
import { serve } from "@hono/node-server";
import { ConfigError, loadConfig, loadDotEnv } from "./config.ts";
import { createFacilitatorClient } from "./facilitator.ts";
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
const { network } = config;
const facilitator = createFacilitatorClient({ network, apiKey: config.apiKey });
const { app } = createSellerApp({ facilitator, payTo: config.payTo, network });
serve({ fetch: app.fetch, port: config.port });
console.log(
  `seller listening on http://localhost:${config.port} network=${network.label} (${network.caip2}) ` +
    `facilitator=${network.facilitatorUrl} payTo=${config.payTo} ` +
    (network.facilitatorApiKey ? `${network.facilitatorApiKey.env}=set` : "X402_API_KEY=not needed"),
);
