import { assertCentavos, type Centavos } from "./money.js";
import { computeUnitCost, maxCommitments, type PricingPolicy } from "./pricing.js";

export type CampaignStatus = "draft" | "active" | "paused" | "closed";

export interface Sku {
  code: string;
  name: string;
  /** Precio de góndola de referencia, para calcular la recompensa. */
  price: Centavos;
}

export interface CampaignLimits {
  /** Campañas de primera prueba: 1. */
  maxClaimsPerBuyer: number;
  /**
   * Techo por comercio adicional al de sell-in. Opcional: el techo duro es
   * siempre lo que el comercio le compró al distribuidor (ver verification.ts).
   */
  maxClaimsPerMerchant?: number;
}

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  status: CampaignStatus;
  skus: Sku[];
  merchantIds: string[];
  startsAt: Date;
  endsAt: Date;
  budget: Centavos;
  pricing: PricingPolicy;
  limits: CampaignLimits;
  /** Hay una fuente de fondos confirmada (contrato firmado, escrow fondeado o depósito). */
  fundingConfirmed: boolean;
  termsUrl?: string;
}

export class CampaignError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CampaignError";
  }
}

export const MAX_MERCHANTS_PER_PILOT = 10;

/** Lista de problemas que impiden activar la campaña. Vacía = activable. */
export function activationProblems(c: Campaign): string[] {
  const problems: string[] = [];
  if (c.status !== "draft" && c.status !== "paused") problems.push(`estado ${c.status} no se puede activar`);
  if (!c.fundingConfirmed) problems.push("no hay fuente de financiación confirmada");
  try {
    assertCentavos(c.budget, "presupuesto");
    if (c.budget <= 0) problems.push("el presupuesto debe ser mayor a 0");
  } catch (e) {
    problems.push((e as Error).message);
  }
  if (c.endsAt <= c.startsAt) problems.push("la fecha de fin debe ser posterior a la de inicio");
  if (c.skus.length === 0) problems.push("la campaña necesita al menos un SKU");
  if (c.merchantIds.length === 0) problems.push("la campaña necesita al menos un comercio");
  if (c.merchantIds.length > MAX_MERCHANTS_PER_PILOT) {
    problems.push(`el piloto admite hasta ${MAX_MERCHANTS_PER_PILOT} comercios`);
  }
  if (c.limits.maxClaimsPerBuyer < 1) problems.push("maxClaimsPerBuyer debe ser ≥ 1");
  for (const sku of c.skus) {
    const unit = computeUnitCost(c.pricing, sku.price);
    if (unit.totalToBrand > c.budget) problems.push(`el presupuesto no alcanza ni para una compra de ${sku.code}`);
  }
  return problems;
}

export function activateCampaign(c: Campaign): Campaign {
  const problems = activationProblems(c);
  if (problems.length > 0) {
    throw new CampaignError("NOT_ACTIVATABLE", `No se puede activar: ${problems.join("; ")}`);
  }
  return { ...c, status: "active" };
}

export function isLive(c: Campaign, at: Date): boolean {
  return c.status === "active" && at >= c.startsAt && at <= c.endsAt;
}

export function findSku(c: Campaign, code: string): Sku | undefined {
  return c.skus.find((s) => s.code === code);
}

/** Compromisos máximos por SKU, para mostrarle a la marca antes de activar. */
export function commitmentPreview(c: Campaign): Array<{ sku: string; unitCost: number; maxPurchases: number }> {
  return c.skus.map((sku) => {
    const unit = computeUnitCost(c.pricing, sku.price);
    return { sku: sku.code, unitCost: unit.totalToBrand, maxPurchases: maxCommitments(c.budget, unit) };
  });
}
