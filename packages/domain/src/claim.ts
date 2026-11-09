/**
 * Ciclo de vida de un reclamo (doc 02 §8.2):
 *
 * draft → submitted → under_review → approved | rejected → payout_pending → paid | payout_failed
 * Un reclamo aprobado o pagado puede pasar a disputed y, con autorización, a reversed/adjusted.
 * Cada transición genera un evento de auditoría.
 */
export type ClaimStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "payout_pending"
  | "paid"
  | "payout_failed"
  | "disputed"
  | "reversed"
  | "adjusted";

const TRANSITIONS: Record<ClaimStatus, readonly ClaimStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review", "approved", "rejected"],
  under_review: ["approved", "rejected"],
  approved: ["payout_pending", "disputed"],
  payout_pending: ["paid", "payout_failed", "disputed"],
  payout_failed: ["payout_pending", "disputed"],
  paid: ["disputed"],
  disputed: ["reversed", "adjusted", "approved"],
  rejected: [],
  reversed: [],
  adjusted: [],
};

export type Actor =
  | { kind: "system" }
  | { kind: "operator"; id: string }
  | { kind: "buyer"; id: string }
  | { kind: "payment_provider"; ref: string };

export interface Claim {
  id: string;
  campaignId: string;
  merchantId: string;
  skuCode: string;
  /** Hash con sal del CVU/CUIL del comprador. Nunca el dato en claro. */
  buyerKey: string;
  status: ClaimStatus;
  claimedAt: Date;
  purchasedAt: Date;
  /** Bloqueo manual del operador: si está activo no sale ningún pago. */
  payoutBlocked: boolean;
}

export interface AuditEvent {
  claimId: string;
  from: ClaimStatus;
  to: ClaimStatus;
  actor: Actor;
  reason: string;
  at: Date;
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: ClaimStatus,
    public readonly to: ClaimStatus,
  ) {
    super(`Transición no permitida: ${from} → ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(status: ClaimStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function transition(
  claim: Claim,
  to: ClaimStatus,
  actor: Actor,
  reason: string,
  at: Date = new Date(),
): { claim: Claim; event: AuditEvent } {
  if (!canTransition(claim.status, to)) throw new InvalidTransitionError(claim.status, to);
  if (to === "payout_pending" && claim.payoutBlocked) {
    throw new InvalidTransitionError(claim.status, to);
  }
  if (reason.trim() === "") throw new Error("Toda transición necesita un motivo");
  const event: AuditEvent = { claimId: claim.id, from: claim.status, to, actor, reason, at };
  return { claim: { ...claim, status: to }, event };
}
