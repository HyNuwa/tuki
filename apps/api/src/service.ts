import { createHmac, randomBytes, randomUUID } from "node:crypto";
import {
  activateCampaign,
  CampaignLedger,
  computeUnitCost,
  evaluateClaim,
  findSku,
  transition,
  type Actor,
  type AuditEvent,
  type Campaign,
  type Centavos,
  type Claim,
  type ClaimStatus,
  type Evidence,
  type VerificationResult,
} from "@rvn/domain";

/**
 * Servicio en memoria. Sirve para desarrollar la UI y probar flujos de punta a punta.
 * En producción, cada Map pasa a una tabla de packages/db (mismas reglas, con
 * constraints únicos y transacciones en vez de chequeos en memoria).
 */

export interface Merchant {
  id: string;
  name: string;
  cuit: string;
  phone: string;
  address: string;
  approved: boolean;
}

export interface SellInRecord {
  invoiceRef: string;
  merchantId: string;
  skuCode: string;
  units: number;
}

export interface MerchantCode {
  code: string;
  campaignId: string;
  merchantId: string;
  used: boolean;
}

export interface PayoutOrder {
  id: string;
  claimId: string;
  idempotencyKey: string;
  amount: Centavos;
  status: "pending" | "paid" | "failed";
  providerRef?: string;
}

export interface SubmitClaimInput {
  campaignId: string;
  merchantId: string;
  skuCode: string;
  /** CVU/CBU donde se acredita el reembolso. Se guarda aparte y solo su hash participa en reglas. */
  cvu: string;
  purchasedAt: Date;
  merchantCode?: string;
  paymentProof?: { merchantCuit: string; amount: Centavos; paidAt: Date };
  receiptFingerprint?: string;
  receiptShowsSku?: boolean;
}

export class ServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Reclamos que cuentan contra los límites (todo lo que no fue rechazado ni revertido). */
const COUNTING: ReadonlySet<ClaimStatus> = new Set([
  "submitted",
  "under_review",
  "approved",
  "payout_pending",
  "paid",
  "payout_failed",
  "disputed",
  "adjusted",
]);

export class Service {
  readonly campaigns = new Map<string, Campaign>();
  readonly merchants = new Map<string, Merchant>();
  readonly sellIns = new Map<string, SellInRecord>();
  readonly codes = new Map<string, MerchantCode>();
  readonly claims = new Map<string, Claim>();
  readonly claimResults = new Map<string, VerificationResult>();
  readonly idempotency = new Map<string, string>();
  readonly fingerprints = new Set<string>();
  readonly ledgers = new Map<string, CampaignLedger>();
  readonly payouts = new Map<string, PayoutOrder>();
  readonly audit: AuditEvent[] = [];
  /** PII separada del resto: buyerKey → CVU. En producción, cifrada y con acceso restringido. */
  private readonly buyerVault = new Map<string, string>();

  constructor(
    private readonly buyerKeySalt: string,
    private readonly clock: () => Date = () => new Date(),
  ) {
    if (buyerKeySalt.length < 16) throw new Error("BUYER_KEY_SALT debe tener al menos 16 caracteres");
  }

  // ------------------------------------------------------------ comercios

  addMerchant(input: Omit<Merchant, "id" | "approved">): Merchant {
    const m: Merchant = { ...input, id: randomUUID(), approved: false };
    this.merchants.set(m.id, m);
    return m;
  }

  approveMerchant(id: string): Merchant {
    const m = this.mustGet(this.merchants, id, "comercio");
    m.approved = true;
    return m;
  }

  /** Factura del distribuidor al comercio: define el techo de reclamos por SKU. */
  recordSellIn(rec: SellInRecord): SellInRecord {
    this.mustGet(this.merchants, rec.merchantId, "comercio");
    if (!Number.isInteger(rec.units) || rec.units <= 0) throw new ServiceError(400, "INVALID_UNITS", "Unidades inválidas");
    if (this.sellIns.has(rec.invoiceRef)) throw new ServiceError(409, "DUPLICATE_INVOICE", "Factura ya registrada");
    this.sellIns.set(rec.invoiceRef, rec);
    return rec;
  }

  sellInUnits(merchantId: string, skuCode: string): number {
    let total = 0;
    for (const r of this.sellIns.values()) if (r.merchantId === merchantId && r.skuCode === skuCode) total += r.units;
    return total;
  }

  // ------------------------------------------------------------ campañas

  createCampaign(input: Omit<Campaign, "id" | "status">): Campaign {
    const c: Campaign = { ...input, id: randomUUID(), status: "draft" };
    this.campaigns.set(c.id, c);
    return c;
  }

  activate(id: string): Campaign {
    const c = this.mustGet(this.campaigns, id, "campaña");
    let active: Campaign;
    try {
      active = activateCampaign(c);
    } catch (e) {
      throw new ServiceError(422, "NOT_ACTIVATABLE", (e as Error).message);
    }
    this.campaigns.set(id, active);
    if (!this.ledgers.has(id)) this.ledgers.set(id, new CampaignLedger(active.budget));
    return active;
  }

  offersFor(merchantId: string, at = this.clock()) {
    return [...this.campaigns.values()]
      .filter((c) => c.status === "active" && c.merchantIds.includes(merchantId) && at >= c.startsAt && at <= c.endsAt)
      .map((c) => ({
        campaignId: c.id,
        name: c.name,
        endsAt: c.endsAt,
        termsUrl: c.termsUrl,
        skus: c.skus.map((s) => ({ code: s.code, name: s.name, reward: computeUnitCost(c.pricing, s.price).reward })),
      }));
  }

  /** Código de un solo uso que el almacenero entrega con el producto. */
  issueMerchantCode(campaignId: string, merchantId: string): MerchantCode {
    const c = this.mustGet(this.campaigns, campaignId, "campaña");
    if (!c.merchantIds.includes(merchantId)) throw new ServiceError(403, "MERCHANT_NOT_IN_CAMPAIGN", "Comercio no adherido");
    const code = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
    const mc = { code, campaignId, merchantId, used: false };
    this.codes.set(code, mc);
    return mc;
  }

  // ------------------------------------------------------------ reclamos

  buyerKey(cvu: string): string {
    return createHmac("sha256", this.buyerKeySalt).update(cvu.replace(/\D/g, "")).digest("hex");
  }

  submitClaim(idempotencyKey: string, input: SubmitClaimInput): { claim: Claim; verification: VerificationResult } {
    const prior = this.idempotency.get(idempotencyKey);
    if (prior) return { claim: this.claims.get(prior)!, verification: this.claimResults.get(prior)! };

    const campaign = this.mustGet(this.campaigns, input.campaignId, "campaña");
    const sku = findSku(campaign, input.skuCode);
    const unitCost = sku ? computeUnitCost(campaign.pricing, sku.price).totalToBrand : 0;
    const ledger = this.ledgers.get(campaign.id);
    const buyerKey = this.buyerKey(input.cvu);
    const now = this.clock();

    const code = input.merchantCode ? this.codes.get(input.merchantCode.toUpperCase()) : undefined;
    const evidence: Evidence = {
      merchantCode: input.merchantCode
        ? {
            valid: !!code && !code.used && code.campaignId === campaign.id && code.merchantId === input.merchantId,
            merchantId: code?.merchantId ?? "",
          }
        : undefined,
      paymentProof: input.paymentProof,
      receiptFingerprint: input.receiptFingerprint,
      receiptShowsSku: input.receiptShowsSku,
    };

    const claimsOf = (pred: (c: Claim) => boolean) =>
      [...this.claims.values()].filter((c) => c.campaignId === campaign.id && COUNTING.has(c.status) && pred(c));
    const hourAgo = new Date(now.getTime() - 3_600_000);

    const id = randomUUID();
    const verification = evaluateClaim(
      { id, campaignId: campaign.id, merchantId: input.merchantId, skuCode: input.skuCode, buyerKey, purchasedAt: input.purchasedAt, evidence },
      {
        now,
        campaign,
        merchant: this.merchants.get(input.merchantId),
        buyerClaimsInCampaign: claimsOf((c) => c.buyerKey === buyerKey).length,
        merchantApprovedClaimsForSku: claimsOf((c) => c.merchantId === input.merchantId && c.skuCode === input.skuCode).length,
        merchantSellInUnits: this.sellInUnits(input.merchantId, input.skuCode),
        merchantClaimsLastHour: claimsOf((c) => c.merchantId === input.merchantId && c.claimedAt >= hourAgo).length,
        fingerprintAlreadySeen: !!input.receiptFingerprint && this.fingerprints.has(input.receiptFingerprint),
        budgetAvailable: ledger?.available ?? 0,
        unitCost,
      },
    );

    let claim: Claim = {
      id,
      campaignId: campaign.id,
      merchantId: input.merchantId,
      skuCode: input.skuCode,
      buyerKey,
      status: "submitted",
      claimedAt: now,
      purchasedAt: input.purchasedAt,
      payoutBlocked: false,
    };
    const system: Actor = { kind: "system" };
    const why = verification.reasons.join(",") || `evidencia ${verification.evidenceLevel}`;
    if (verification.outcome === "approve") {
      ledger!.reserve(id, unitCost, now);
      claim = this.apply(claim, "approved", system, why);
    } else if (verification.outcome === "review") {
      claim = this.apply(claim, "under_review", system, why);
    } else {
      claim = this.apply(claim, "rejected", system, why);
    }

    if (verification.outcome !== "reject") {
      if (code) code.used = true;
      if (input.receiptFingerprint) this.fingerprints.add(input.receiptFingerprint);
      this.buyerVault.set(buyerKey, input.cvu);
    }
    this.claims.set(id, claim);
    this.claimResults.set(id, verification);
    this.idempotency.set(idempotencyKey, id);
    return { claim, verification };
  }

  decide(claimId: string, operatorId: string, approve: boolean, reason: string): Claim {
    const claim = this.mustGet(this.claims, claimId, "reclamo");
    if (claim.status !== "under_review") throw new ServiceError(409, "NOT_UNDER_REVIEW", "El reclamo no está en revisión");
    const operator: Actor = { kind: "operator", id: operatorId };
    if (approve) {
      const campaign = this.mustGet(this.campaigns, claim.campaignId, "campaña");
      const sku = findSku(campaign, claim.skuCode)!;
      try {
        this.ledgers.get(campaign.id)!.reserve(claim.id, computeUnitCost(campaign.pricing, sku.price).totalToBrand);
      } catch (e) {
        throw new ServiceError(409, "BUDGET", (e as Error).message);
      }
    }
    const next = this.apply(claim, approve ? "approved" : "rejected", operator, reason);
    this.claims.set(claimId, next);
    return next;
  }

  blockPayout(claimId: string, operatorId: string, reason: string): Claim {
    const claim = this.mustGet(this.claims, claimId, "reclamo");
    const next = { ...claim, payoutBlocked: true };
    this.audit.push({ claimId, from: claim.status, to: claim.status, actor: { kind: "operator", id: operatorId }, reason: `bloqueo: ${reason}`, at: this.clock() });
    this.claims.set(claimId, next);
    return next;
  }

  // ------------------------------------------------------------ pagos

  /** Orden de pago del reembolso al comprador. La ejecuta la marca o su PSP (la plataforma no custodia fondos). */
  createPayout(claimId: string, operatorId: string): PayoutOrder {
    const idempotencyKey = `payout:${claimId}`;
    const existing = [...this.payouts.values()].find((p) => p.idempotencyKey === idempotencyKey);
    const claim = this.mustGet(this.claims, claimId, "reclamo");
    if (existing && existing.status !== "failed") return existing;
    if (claim.payoutBlocked) throw new ServiceError(409, "PAYOUT_BLOCKED", "Pago bloqueado por un operador");
    if (claim.status !== "approved" && claim.status !== "payout_failed") {
      throw new ServiceError(409, "NOT_PAYABLE", `Reclamo en estado ${claim.status}`);
    }
    const campaign = this.mustGet(this.campaigns, claim.campaignId, "campaña");
    const amount = computeUnitCost(campaign.pricing, findSku(campaign, claim.skuCode)!.price).reward;
    const order: PayoutOrder = existing ?? { id: randomUUID(), claimId, idempotencyKey, amount, status: "pending" };
    order.status = "pending";
    this.payouts.set(order.id, order);
    this.claims.set(claimId, this.apply(claim, "payout_pending", { kind: "operator", id: operatorId }, "orden de pago creada"));
    return order;
  }

  /** Confirmación del proveedor de pagos. Idempotente: un webhook duplicado no acredita dos veces. */
  payoutWebhook(payoutId: string, providerRef: string, result: "paid" | "failed"): PayoutOrder {
    const order = this.mustGet(this.payouts, payoutId, "orden de pago");
    if (order.status === "paid") return order;
    const claim = this.mustGet(this.claims, order.claimId, "reclamo");
    const provider: Actor = { kind: "payment_provider", ref: providerRef };
    if (result === "paid") {
      this.ledgers.get(claim.campaignId)!.settle(claim.id);
      order.status = "paid";
      order.providerRef = providerRef;
      this.claims.set(claim.id, this.apply(claim, "paid", provider, "acreditación confirmada"));
    } else if (claim.status === "payout_pending") {
      order.status = "failed";
      this.claims.set(claim.id, this.apply(claim, "payout_failed", provider, "el proveedor informó error"));
    }
    return order;
  }

  // ------------------------------------------------------------ reportes

  /** Reporte para la marca: solo datos agregados, sin CVU, buyerKey ni tickets. */
  report(campaignId: string) {
    const campaign = this.mustGet(this.campaigns, campaignId, "campaña");
    const ledger = this.ledgers.get(campaignId);
    const claims = [...this.claims.values()].filter((c) => c.campaignId === campaignId);
    const byStatus: Partial<Record<ClaimStatus, number>> = {};
    const byMerchant: Record<string, { approved: number; paid: number }> = {};
    for (const c of claims) {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
      const m = (byMerchant[this.merchants.get(c.merchantId)?.name ?? c.merchantId] ??= { approved: 0, paid: 0 });
      if (c.status === "paid") m.paid++;
      if (["approved", "payout_pending", "paid", "payout_failed"].includes(c.status)) m.approved++;
    }
    return {
      campaign: { id: campaign.id, name: campaign.name, status: campaign.status, budget: campaign.budget },
      spend: { committed: ledger?.committed ?? 0, settled: ledger?.settled ?? 0, available: ledger?.available ?? campaign.budget },
      uniqueNewBuyers: new Set(claims.filter((c) => c.status === "paid").map((c) => c.buyerKey)).size,
      byStatus,
      byMerchant,
    };
  }

  // ------------------------------------------------------------ helpers

  private apply(claim: Claim, to: ClaimStatus, actor: Actor, reason: string): Claim {
    const { claim: next, event } = transition(claim, to, actor, reason, this.clock());
    this.audit.push(event);
    return next;
  }

  private mustGet<T>(map: Map<string, T>, id: string, what: string): T {
    const v = map.get(id);
    if (!v) throw new ServiceError(404, "NOT_FOUND", `No existe ${what} ${id}`);
    return v;
  }
}
