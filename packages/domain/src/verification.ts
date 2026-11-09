import { findSku, isLive, type Campaign } from "./campaign.js";
import type { Centavos } from "./money.js";

/**
 * Verificación de compras.
 *
 * Restricción descubierta en la investigación (docs/investigacion/01-discovery/industry-trends.md):
 * ni el QR fiscal de ARCA ni el comprobante de un pago QR traen el SKU, y una foto de
 * ticket ya no es prueba confiable (recibos generados con IA). Por eso la prueba del
 * producto viene del comercio (código de campaña) y se ancla en datos externos:
 *
 *  1. Código de campaña entregado por el almacenero junto con el producto.
 *  2. Comprobante de pago QR: verifica comercio (CUIT), fecha y monto.
 *  3. Techo por sell-in: un comercio no puede tener más reclamos aprobados que las
 *     unidades del SKU que le compró al distribuidor (la factura del distribuidor sí
 *     trae el SKU). Es la defensa principal contra la colusión comercio + amigos.
 *  4. Un reembolso por comprador (buyerKey = hash del CVU/CUIL) en campañas de prueba.
 */

export type EvidenceLevel = "A" | "B" | "C" | "insufficient";

export interface Evidence {
  /** Código de campaña que entregó el comercio, ya validado contra los códigos emitidos. */
  merchantCode?: { valid: boolean; merchantId: string };
  /** Comprobante de pago (QR / transferencia). */
  paymentProof?: { merchantCuit: string; amount: Centavos; paidAt: Date };
  /** Huella del comprobante subido (hash perceptual/contenido), para detectar reutilización. */
  receiptFingerprint?: string;
  /** El ticket tiene un renglón legible con el SKU (OCR). Evidencia blanda. */
  receiptShowsSku?: boolean;
}

export interface ClaimInput {
  id: string;
  campaignId: string;
  merchantId: string;
  skuCode: string;
  buyerKey: string;
  purchasedAt: Date;
  evidence: Evidence;
}

export interface MerchantInfo {
  id: string;
  cuit: string;
  approved: boolean;
}

export interface VerificationContext {
  now: Date;
  campaign: Campaign;
  merchant: MerchantInfo | undefined;
  /** Reclamos no rechazados de este comprador en la campaña. */
  buyerClaimsInCampaign: number;
  /** Reclamos aprobados (o en curso de pago) del comercio para este SKU. */
  merchantApprovedClaimsForSku: number;
  /** Unidades del SKU que el comercio compró al distribuidor (facturas de sell-in). */
  merchantSellInUnits: number;
  /** Reclamos del comercio en la última hora. */
  merchantClaimsLastHour: number;
  fingerprintAlreadySeen: boolean;
  /** Presupuesto todavía no reservado ni gastado. */
  budgetAvailable: Centavos;
  unitCost: Centavos;
}

export type ReasonCode =
  | "CAMPAIGN_NOT_LIVE"
  | "MERCHANT_NOT_IN_CAMPAIGN"
  | "MERCHANT_NOT_APPROVED"
  | "SKU_NOT_ELIGIBLE"
  | "PURCHASE_OUTSIDE_CAMPAIGN"
  | "BUYER_LIMIT_REACHED"
  | "DUPLICATE_EVIDENCE"
  | "BUDGET_EXHAUSTED"
  | "SELL_IN_CAP_REACHED"
  | "MERCHANT_CAP_REACHED"
  | "MERCHANT_CODE_INVALID"
  | "PAYMENT_MISMATCH"
  | "INSUFFICIENT_EVIDENCE"
  | "SOFT_EVIDENCE_ONLY"
  | "MERCHANT_VELOCITY"
  | "NEAR_SELL_IN_CAP"
  | "AUDIT_SAMPLE";

export type Outcome = "approve" | "review" | "reject";

export interface VerificationResult {
  outcome: Outcome;
  evidenceLevel: EvidenceLevel;
  reasons: ReasonCode[];
}

export interface VerificationConfig {
  /** Ventana máxima entre la compra y el pago informado. */
  paymentWindowMinutes: number;
  /** Reclamos por hora de un mismo comercio que disparan revisión. */
  merchantVelocityPerHour: number;
  /** Fracción del techo de sell-in a partir de la cual todo va a revisión. */
  nearSellInCapRatio: number;
  /** 1 de cada N reclamos de nivel B se revisa a mano (muestreo determinístico). */
  auditOneInN: number;
}

export const DEFAULT_VERIFICATION_CONFIG: VerificationConfig = {
  paymentWindowMinutes: 30,
  merchantVelocityPerHour: 12,
  nearSellInCapRatio: 0.8,
  auditOneInN: 10,
};

function paymentMatches(input: ClaimInput, ctx: VerificationContext, cfg: VerificationConfig): boolean {
  const p = input.evidence.paymentProof;
  const sku = findSku(ctx.campaign, input.skuCode);
  if (!p || !ctx.merchant || !sku) return false;
  const minutes = Math.abs(p.paidAt.getTime() - input.purchasedAt.getTime()) / 60_000;
  return p.merchantCuit === ctx.merchant.cuit && p.amount >= sku.price && minutes <= cfg.paymentWindowMinutes;
}

export function classifyEvidence(input: ClaimInput, ctx: VerificationContext, cfg = DEFAULT_VERIFICATION_CONFIG): EvidenceLevel {
  const e = input.evidence;
  const codeOk = e.merchantCode?.valid === true && e.merchantCode.merchantId === input.merchantId;
  const payOk = paymentMatches(input, ctx, cfg);
  if (codeOk && payOk) return "A";
  if (codeOk || (payOk && e.receiptShowsSku)) return "B";
  if (e.receiptShowsSku) return "C";
  return "insufficient";
}

/** Hash FNV-1a de 32 bits: muestreo estable y reproducible por id de reclamo. */
function stableBucket(id: string, n: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % n;
}

export function evaluateClaim(
  input: ClaimInput,
  ctx: VerificationContext,
  cfg: VerificationConfig = DEFAULT_VERIFICATION_CONFIG,
): VerificationResult {
  const c = ctx.campaign;
  const hard: ReasonCode[] = [];

  // 1) Rechazos duros (doc 02 §8.1).
  if (!isLive(c, ctx.now)) hard.push("CAMPAIGN_NOT_LIVE");
  if (input.purchasedAt < c.startsAt || input.purchasedAt > c.endsAt) hard.push("PURCHASE_OUTSIDE_CAMPAIGN");
  if (!c.merchantIds.includes(input.merchantId)) hard.push("MERCHANT_NOT_IN_CAMPAIGN");
  if (!ctx.merchant?.approved) hard.push("MERCHANT_NOT_APPROVED");
  if (!findSku(c, input.skuCode)) hard.push("SKU_NOT_ELIGIBLE");
  if (ctx.buyerClaimsInCampaign >= c.limits.maxClaimsPerBuyer) hard.push("BUYER_LIMIT_REACHED");
  if (ctx.fingerprintAlreadySeen) hard.push("DUPLICATE_EVIDENCE");
  if (ctx.budgetAvailable < ctx.unitCost) hard.push("BUDGET_EXHAUSTED");
  if (ctx.merchantApprovedClaimsForSku >= ctx.merchantSellInUnits) hard.push("SELL_IN_CAP_REACHED");
  if (c.limits.maxClaimsPerMerchant !== undefined && ctx.merchantApprovedClaimsForSku >= c.limits.maxClaimsPerMerchant) {
    hard.push("MERCHANT_CAP_REACHED");
  }
  if (input.evidence.merchantCode && !input.evidence.merchantCode.valid) hard.push("MERCHANT_CODE_INVALID");

  const level = classifyEvidence(input, ctx, cfg);
  if (hard.length > 0) return { outcome: "reject", evidenceLevel: level, reasons: hard };

  // 2) Señales que mandan a revisión humana.
  const soft: ReasonCode[] = [];
  if (input.evidence.paymentProof && !paymentMatches(input, ctx, cfg)) soft.push("PAYMENT_MISMATCH");
  if (level === "insufficient") soft.push("INSUFFICIENT_EVIDENCE");
  if (level === "C") soft.push("SOFT_EVIDENCE_ONLY");
  if (ctx.merchantClaimsLastHour >= cfg.merchantVelocityPerHour) soft.push("MERCHANT_VELOCITY");
  if (ctx.merchantSellInUnits > 0 && (ctx.merchantApprovedClaimsForSku + 1) / ctx.merchantSellInUnits >= cfg.nearSellInCapRatio) {
    soft.push("NEAR_SELL_IN_CAP");
  }
  if (level === "B" && stableBucket(input.id, cfg.auditOneInN) === 0) soft.push("AUDIT_SAMPLE");

  if (soft.length > 0) return { outcome: "review", evidenceLevel: level, reasons: soft };
  return { outcome: "approve", evidenceLevel: level, reasons: [] };
}
