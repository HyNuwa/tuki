import { assertCentavos, type Centavos } from "./money.js";

/**
 * Libro mayor del presupuesto de una campaña.
 *
 * Reglas (doc 02 §6 RF-07 y §10):
 * - Se reserva antes de pagar; nunca se supera el presupuesto.
 * - Una sola reserva por reclamo: la misma claim nunca se acredita dos veces.
 * - No hay borrado: una reversa es un asiento compensatorio.
 */
export type EntryType = "reserve" | "release" | "settle" | "reverse";

export interface LedgerEntry {
  seq: number;
  claimId: string;
  type: EntryType;
  amount: Centavos;
  at: Date;
}

export type ReservationState = "reserved" | "settled" | "released" | "reversed";

export class LedgerError extends Error {
  constructor(
    public readonly code: "INSUFFICIENT_BUDGET" | "ALREADY_RESERVED" | "NOT_RESERVED" | "INVALID_STATE",
    message: string,
  ) {
    super(message);
    this.name = "LedgerError";
  }
}

export class CampaignLedger {
  private readonly entries: LedgerEntry[] = [];
  private readonly state = new Map<string, { amount: Centavos; status: ReservationState }>();

  constructor(public readonly budget: Centavos) {
    assertCentavos(budget, "presupuesto");
  }

  /** Reservado + liquidado. Lo liberado y lo revertido vuelve a estar disponible. */
  get committed(): Centavos {
    let total = 0;
    for (const r of this.state.values()) if (r.status === "reserved" || r.status === "settled") total += r.amount;
    return total;
  }

  get settled(): Centavos {
    let total = 0;
    for (const r of this.state.values()) if (r.status === "settled") total += r.amount;
    return total;
  }

  get available(): Centavos {
    return this.budget - this.committed;
  }

  statusOf(claimId: string): ReservationState | undefined {
    return this.state.get(claimId)?.status;
  }

  history(): readonly LedgerEntry[] {
    return [...this.entries];
  }

  reserve(claimId: string, amount: Centavos, at = new Date()): LedgerEntry {
    assertCentavos(amount, "monto a reservar");
    if (this.state.has(claimId)) {
      throw new LedgerError("ALREADY_RESERVED", `El reclamo ${claimId} ya tiene una reserva`);
    }
    if (amount > this.available) {
      throw new LedgerError("INSUFFICIENT_BUDGET", `Presupuesto insuficiente: disponible ${this.available}, pedido ${amount}`);
    }
    this.state.set(claimId, { amount, status: "reserved" });
    return this.push(claimId, "reserve", amount, at);
  }

  /** El pago falló definitivamente o el reclamo se rechazó después de reservar. */
  release(claimId: string, at = new Date()): LedgerEntry {
    const r = this.require(claimId, "reserved");
    r.status = "released";
    return this.push(claimId, "release", r.amount, at);
  }

  /** El proveedor de pagos confirmó la acreditación. Idempotente. */
  settle(claimId: string, at = new Date()): LedgerEntry | undefined {
    const r = this.state.get(claimId);
    if (r?.status === "settled") return undefined; // webhook duplicado: sin efecto
    const reserved = this.require(claimId, "reserved");
    reserved.status = "settled";
    return this.push(claimId, "settle", reserved.amount, at);
  }

  /** Disputa resuelta en contra: asiento compensatorio, nunca borrado. */
  reverse(claimId: string, at = new Date()): LedgerEntry {
    const r = this.require(claimId, "settled");
    r.status = "reversed";
    return this.push(claimId, "reverse", r.amount, at);
  }

  private require(claimId: string, expected: ReservationState) {
    const r = this.state.get(claimId);
    if (!r) throw new LedgerError("NOT_RESERVED", `El reclamo ${claimId} no tiene reserva`);
    if (r.status !== expected) {
      throw new LedgerError("INVALID_STATE", `El reclamo ${claimId} está ${r.status}, se esperaba ${expected}`);
    }
    return r;
  }

  private push(claimId: string, type: EntryType, amount: Centavos, at: Date): LedgerEntry {
    const entry = { seq: this.entries.length + 1, claimId, type, amount, at };
    this.entries.push(entry);
    return entry;
  }
}
