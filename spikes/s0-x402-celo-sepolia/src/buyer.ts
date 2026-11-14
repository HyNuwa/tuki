/**
 * Buyer-side pieces shared by the agent script and the tests.
 */
import type { ClientExtension } from "@x402/core/client";
import { PAYMENT_IDENTIFIER, appendPaymentIdentifierToExtensions, generatePaymentId } from "@x402/extensions/payment-identifier";
import { x402Client, wrapFetchWithPayment, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import type { SettleResponse } from "@x402/core/types";
import { isAddressEqual, type Address, type LocalAccount } from "viem";
import type { DataProduct } from "./catalog.ts";
import { DEFAULT_NETWORK, type NetworkConfig } from "./network.ts";

/**
 * Client extension that stamps a caller-chosen payment id into the payload's `payment-identifier`
 * extension. Reusing the same id when retrying one purchase lets the seller recognise the retry
 * and return the first settlement instead of charging again.
 */
export function paymentIdentifierClientExtension(paymentId: string): ClientExtension {
  return {
    key: PAYMENT_IDENTIFIER,
    async enrichPaymentPayload(payload) {
      if (!payload.extensions?.[PAYMENT_IDENTIFIER]) return payload;
      const extensions = structuredClone(payload.extensions);
      return { ...payload, extensions: appendPaymentIdentifierToExtensions(extensions, paymentId) };
    },
  };
}

export type BuyerFetchOptions = {
  account: LocalAccount;
  /** Per-payment cap in USDC base units. The client refuses any 402 above it before signing. */
  capAtomic: string;
  fetch?: typeof fetch;
  /** Reuse the same id when retrying one purchase. */
  paymentId?: string;
  /** Default: Base Sepolia. The client only pays this network's USDC. */
  network?: NetworkConfig;
};

/** @x402/fetch wrapper with spend controls capped to one product price, the network's USDC only. */
export function createBuyerFetch(opts: BuyerFetchOptions): typeof fetch {
  const network = opts.network ?? DEFAULT_NETWORK;
  const client = new x402Client();
  // setSpendControls, not the constructor (the constructor ignores a config object).
  client.setSpendControls({
    allowedAssets: [{ network: network.caip2, asset: network.usdc.address, maxAmountPerPayment: opts.capAtomic }],
  });
  client.register(network.caip2, new ExactEvmScheme(opts.account, { rpcUrl: network.rpcUrl }));
  client.registerExtension(paymentIdentifierClientExtension(opts.paymentId ?? generatePaymentId()));
  return wrapFetchWithPayment(opts.fetch ?? fetch, client) as typeof fetch;
}

export type AgentOptions = {
  baseUrl: string;
  account: LocalAccount;
  budgetAtomic: string;
  wantZone: string;
  /** Default: Base Sepolia. */
  network?: NetworkConfig;
  fetch?: typeof fetch;
  log: (line: string) => void;
};

export type AgentResult =
  | { kind: "skipped"; reason: string }
  | { kind: "paid"; status: number; data: unknown; settlement: SettleResponse | null };

function acceptable(p: DataProduct, network: NetworkConfig, budget: bigint, zone: string): boolean {
  return (
    p.price.token.network === network.caip2 &&
    isAddressEqual(p.price.token.address as Address, network.usdc.address) &&
    BigInt(p.price.amountAtomic) <= budget &&
    p.coverage.zones.includes(zone) &&
    p.counts.observations > 0
  );
}

/** Simple automatic buyer: discover -> choose -> check price/coverage -> pay -> consume. */
export async function runAgent(opts: AgentOptions): Promise<AgentResult> {
  const doFetch = opts.fetch ?? fetch;
  const network = opts.network ?? DEFAULT_NETWORK;
  const log = opts.log;
  log(`agent ${opts.account.address} network=${network.label} (${network.caip2}) budget=${opts.budgetAtomic} atomic USDC zone=${opts.wantZone}`);
  const catalogRes = await doFetch(`${opts.baseUrl}/v1/products`);
  const { products } = (await catalogRes.json()) as { products: DataProduct[] };
  log(`catalog: ${products.length} product(s)`);
  const product = products.find((p) => acceptable(p, network, BigInt(opts.budgetAtomic), opts.wantZone));
  if (!product) {
    log("no product within budget and coverage; not paying");
    return { kind: "skipped", reason: "no product within budget and coverage" };
  }
  log(`chosen ${product.dataProductId} price=${product.price.amountAtomic} ${product.price.token.symbol} (fixture=${product.fixture})`);
  const payFetch = createBuyerFetch({ account: opts.account, capAtomic: product.price.amountAtomic, fetch: doFetch, network });
  const res = await payFetch(`${opts.baseUrl}/v1/products/${product.dataProductId}/data`);
  const header = res.headers.get("payment-response");
  const settlement = header ? (decodePaymentResponseHeader(header) as SettleResponse) : null;
  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    // keep raw text
  }
  log(`status: ${res.status}`);
  log(`data: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  log(`payment-response: ${settlement ? JSON.stringify(settlement) : "none"}`);
  if (settlement?.success && settlement.transaction) log(`tx: ${network.explorerTxUrl}${settlement.transaction}`);
  return { kind: "paid", status: res.status, data, settlement };
}
