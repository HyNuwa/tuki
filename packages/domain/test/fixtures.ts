import type { Campaign } from "../src/campaign.js";
import type { ClaimInput, VerificationContext } from "../src/verification.js";

export const T0 = new Date("2026-12-01T12:00:00-03:00");
export const minutes = (m: number) => new Date(T0.getTime() + m * 60_000);

/** Yerba regional de 500 g a $3.126 (precio estimado nov-2026). */
export function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "camp-1",
    brandId: "brand-1",
    name: "Prueba yerba regional",
    status: "draft",
    skus: [{ code: "YERBA-500", name: "Yerba 500 g", price: 312_600 }],
    merchantIds: ["m-1", "m-2"],
    startsAt: new Date("2026-11-25T00:00:00-03:00"),
    endsAt: new Date("2026-12-09T23:59:59-03:00"),
    budget: 50_000_000, // $500.000
    pricing: {
      reward: { kind: "percentOfPrice", bps: 2_500, cap: 120_000, floor: 30_000 },
      merchantIncentive: 23_500,
      platformFee: 50_000,
      launchFee: 15_700_000,
    },
    limits: { maxClaimsPerBuyer: 1 },
    fundingConfirmed: true,
    ...overrides,
  };
}

export function claimInput(overrides: Partial<ClaimInput> = {}): ClaimInput {
  return {
    id: "claim-1",
    campaignId: "camp-1",
    merchantId: "m-1",
    skuCode: "YERBA-500",
    buyerKey: "buyer-hash-1",
    purchasedAt: T0,
    evidence: {
      merchantCode: { valid: true, merchantId: "m-1" },
      paymentProof: { merchantCuit: "20-11111111-1", amount: 312_600, paidAt: minutes(1) },
    },
    ...overrides,
  };
}

export function context(overrides: Partial<VerificationContext> = {}): VerificationContext {
  return {
    now: minutes(5),
    campaign: { ...campaign(), status: "active" },
    merchant: { id: "m-1", cuit: "20-11111111-1", approved: true },
    buyerClaimsInCampaign: 0,
    merchantApprovedClaimsForSku: 0,
    merchantSellInUnits: 48,
    merchantClaimsLastHour: 0,
    fingerprintAlreadySeen: false,
    budgetAvailable: 50_000_000,
    unitCost: 151_650,
    ...overrides,
  };
}
