import { applyBps, assertCentavos, type Centavos } from "./money.js";

/**
 * Cómo se calcula la recompensa al comprador.
 *
 * La investigación (docs/investigacion/01-discovery/market-analysis.md §2) mostró
 * que un monto fijo de USD 1,50 por compra supera el 100 % del precio de un SKU
 * barato: la marca pierde plata. Por eso el modo recomendado es un porcentaje
 * del precio del SKU con tope y piso.
 */
export type RewardRule =
  | { kind: "fixed"; amount: Centavos }
  | { kind: "percentOfPrice"; bps: number; cap: Centavos; floor?: Centavos };

export interface PricingPolicy {
  reward: RewardRule;
  /** Incentivo al almacenero por compra validada. */
  merchantIncentive: Centavos;
  /** Comisión de la plataforma por compra validada (cubre verificación y soporte). */
  platformFee: Centavos;
  /** Fee fijo por campaña. */
  launchFee: Centavos;
}

export interface UnitCost {
  reward: Centavos;
  merchantIncentive: Centavos;
  platformFee: Centavos;
  /** Lo que la marca paga por cada compra validada. */
  totalToBrand: Centavos;
}

export function computeReward(rule: RewardRule, skuPrice: Centavos): Centavos {
  assertCentavos(skuPrice, "precio del SKU");
  if (rule.kind === "fixed") return assertCentavos(rule.amount, "recompensa fija");
  const raw = applyBps(skuPrice, rule.bps);
  const floored = Math.max(raw, rule.floor ?? 0);
  return Math.min(floored, rule.cap);
}

export function computeUnitCost(policy: PricingPolicy, skuPrice: Centavos): UnitCost {
  const reward = computeReward(policy.reward, skuPrice);
  const merchantIncentive = assertCentavos(policy.merchantIncentive, "incentivo al comercio");
  const platformFee = assertCentavos(policy.platformFee, "comisión de plataforma");
  return {
    reward,
    merchantIncentive,
    platformFee,
    totalToBrand: reward + merchantIncentive + platformFee,
  };
}

/** Cuántas compras validadas alcanza a cubrir un presupuesto. */
export function maxCommitments(budget: Centavos, unit: UnitCost): number {
  assertCentavos(budget, "presupuesto");
  if (unit.totalToBrand === 0) throw new RangeError("El costo unitario no puede ser 0");
  return Math.floor(budget / unit.totalToBrand);
}

/**
 * Cuántas unidades tiene que recomprar el comprador nuevo para que la marca
 * recupere lo que pagó por su primera prueba. Es la pregunta que decide si una
 * campaña tiene sentido para la marca.
 *
 * @param grossProfitPerUnit ganancia bruta de la marca por unidad vendida.
 */
export function repurchasesToBreakEven(unit: UnitCost, grossProfitPerUnit: Centavos): number {
  assertCentavos(grossProfitPerUnit, "ganancia bruta por unidad");
  if (grossProfitPerUnit === 0) return Number.POSITIVE_INFINITY;
  // La primera compra también deja ganancia bruta.
  const pending = unit.totalToBrand - grossProfitPerUnit;
  return pending <= 0 ? 0 : Math.ceil(pending / grossProfitPerUnit);
}
