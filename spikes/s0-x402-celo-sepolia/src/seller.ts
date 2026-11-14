/**
 * Seller app for spike S0. Free discovery (`GET /v1/products`) plus one paid route
 * (`GET /v1/products/:id/data`) priced at 10000 atomic USDC through x402 `exact`, on the selected
 * network (Base Sepolia by default, Celo Sepolia as an alternative).
 *
 * The facilitator is injected (`FacilitatorClient`): the real HTTP client in `server.ts`,
 * an in-process FAKE in the tests.
 */
import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import type { FacilitatorClient, RoutesConfig } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { PAYMENT_IDENTIFIER, declarePaymentIdentifierExtension, paymentIdentifierResourceServerExtension } from "@x402/extensions/payment-identifier";
import type { Address } from "viem";
import { fixtureAggregate, fixtureProduct, type DataProduct } from "./catalog.ts";
import { DEFAULT_NETWORK, priceFor, type NetworkConfig } from "./network.ts";
import { SettlementGuard } from "./settlement-guard.ts";

export type SellerDeps = {
  facilitator: FacilitatorClient;
  payTo: Address;
  /** Default: Base Sepolia. Products default to the fixture priced on this network. */
  network?: NetworkConfig;
  products?: DataProduct[];
};

export function dataPath(product: DataProduct): string {
  return `/v1/products/${product.dataProductId}/data`;
}

export function buildRoutes(products: DataProduct[], payTo: Address, network: NetworkConfig = DEFAULT_NETWORK): RoutesConfig {
  return Object.fromEntries(
    products.map((p) => [
      `GET ${dataPath(p)}`,
      {
        accepts: [
          {
            scheme: "exact",
            network: network.caip2,
            payTo,
            // Explicit price object, never "$0.01": asset and EIP-712 domain are named here.
            price: priceFor(network, p.price.amountAtomic),
          },
        ],
        description: p.title,
        mimeType: "application/json",
        extensions: { [PAYMENT_IDENTIFIER]: declarePaymentIdentifierExtension(false) },
      },
    ]),
  );
}

export function createSellerApp(deps: SellerDeps) {
  const network = deps.network ?? DEFAULT_NETWORK;
  const products = deps.products ?? [fixtureProduct(network)];
  const resourceServer = new x402ResourceServer(deps.facilitator);
  resourceServer.register(network.caip2, new ExactEvmScheme());
  resourceServer.registerExtension(paymentIdentifierResourceServerExtension);
  const guard = new SettlementGuard().attach(resourceServer);

  const app = new Hono();
  app.get("/v1/products", (c) => c.json({ products }));
  app.use(paymentMiddleware(buildRoutes(products, deps.payTo, network), resourceServer));
  app.get("/v1/products/:id/data", (c) => {
    const product = products.find((p) => p.dataProductId === c.req.param("id"));
    if (!product) return c.json({ error: "unknown_product" }, 404);
    return c.json(fixtureAggregate(product));
  });
  return { app, guard };
}
