/**
 * TEST FIXTURE catalog. One DataProduct shaped like the contract in docs/04-arquitectura-tecnica.md.
 * The numbers are invented for spike S0; they are not real observations or real prices.
 */
import { DEFAULT_NETWORK, PRODUCT_PRICE_ATOMIC, type NetworkConfig } from "./network.ts";

type VerificationLevel = "L0_unverified" | "L1_fiscal_qr" | "L2_fiscal_confirmed" | "L3_corroborated";

export type TokenRef = { network: string; address: string; symbol: string; decimals: number };

export type DataProduct = {
  dataProductId: string;
  title: string;
  coverage: { zones: string[]; storeKinds: Array<"supermarket" | "almacen" | "kiosco" | "other">; storesCount: number; categories: string[] };
  freshness: { oldestObservedAt: string; newestObservedAt: string; refreshPolicy: string };
  origin: Array<"receipt" | "shelf_photo">;
  minVerificationLevel: VerificationLevel;
  counts: { observations: number; contributors: number };
  license: { id: string; summary: string; resale: false; reidentification: "forbidden" };
  price: { amountAtomic: string; token: TokenRef; unit: "query" | "cell" };
  sample?: object;
  /** Spike-only marker: this product and its data are a test fixture. */
  fixture: true;
};

export function usdcTokenRef(network: NetworkConfig): TokenRef {
  return { network: network.caip2, address: network.usdc.address, symbol: "USDC", decimals: network.usdc.decimals };
}

/** The fixture product priced in the given network's USDC. */
export function fixtureProduct(network: NetworkConfig = DEFAULT_NETWORK): DataProduct {
  return {
    dataProductId: "dp_test_fixture_milk_noa",
    title: "[TEST FIXTURE] Precio pagado de leche entera 1 l, NOA",
    coverage: { zones: ["AR-Y-San-Salvador-de-Jujuy"], storeKinds: ["supermarket", "almacen"], storesCount: 5, categories: ["leche-entera-1l"] },
    freshness: { oldestObservedAt: "2026-11-01T00:00:00Z", newestObservedAt: "2026-11-12T00:00:00Z", refreshPolicy: "fixture: never refreshed" },
    origin: ["receipt"],
    minVerificationLevel: "L1_fiscal_qr",
    counts: { observations: 30, contributors: 5 },
    license: { id: "test-fixture-only", summary: "Spike S0 fixture. Not real data. No resale, no reidentification.", resale: false, reidentification: "forbidden" },
    price: { amountAtomic: PRODUCT_PRICE_ATOMIC, token: usdcTokenRef(network), unit: "query" },
    sample: { median: "number (ARS)", p25: "number (ARS)", p75: "number (ARS)", observations: "number" },
    fixture: true,
  };
}

/** The fixture product on the default network (Base Sepolia). */
export const FIXTURE_PRODUCT: DataProduct = fixtureProduct();

/** The paid result. Invented numbers, labelled as a fixture. */
export function fixtureAggregate(product: DataProduct) {
  return {
    dataProductId: product.dataProductId,
    fixture: true,
    note: "TEST FIXTURE - invented numbers for spike S0, not real prices",
    result: { currency: "ARS", median: 1450, p25: 1390, p75: 1520, observations: 30, contributors: 5 },
  };
}
