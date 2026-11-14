/**
 * Server-side double-charge guard, attached to x402ResourceServer hooks.
 *
 * What the stack gives us (checked in @x402/* 2.31.0):
 *  - EIP-3009 nonces are single-use on-chain, so the SAME signed payload can never move funds twice.
 *  - The `payment-identifier` extension (@x402/extensions) only declares and carries an id; the
 *    SDK does not deduplicate by it. A buyer that re-signs a retry (new nonce) would be charged again.
 *  - A settle timeout is an indeterminate outcome (FacilitatorTimeoutError docs): funds may have moved.
 *
 * So this guard keeps an in-memory ledger keyed by
 *  - the authorization (network, asset, payer, nonce): an exact replay returns the cached settlement;
 *  - (payer, payment-identifier): a re-signed retry of the same purchase returns the cached settlement;
 * serialises concurrent settles of the same purchase, and refuses to settle a purchase whose
 * previous settle outcome is unknown. Spike scope: in-memory, single process, lost on restart.
 */
import { FacilitatorTimeoutError, type x402ResourceServer } from "@x402/core/server";
import type { SettleResponse } from "@x402/core/types";
import { extractPaymentIdentifier } from "@x402/extensions/payment-identifier";

type Payload = { readonly payload: Readonly<Record<string, unknown>>; readonly accepted: { readonly network: string; readonly asset: string }; readonly extensions?: Readonly<Record<string, unknown>> };
type Authorization = { from: string; nonce: string };

type Entry =
  | { state: "settled"; result: SettleResponse; signature: string }
  | { state: "in_flight"; done: Promise<SettleResponse | null> }
  | { state: "indeterminate" };

export const OUTCOME_UNKNOWN = "settlement_outcome_unknown";

function authorizationOf(p: Payload): Authorization | null {
  const auth = p.payload["authorization"] as Partial<Authorization> | undefined;
  return auth?.from && auth.nonce ? { from: auth.from, nonce: auth.nonce } : null;
}

export class SettlementGuard {
  private readonly entries = new Map<string, Entry>();
  private readonly resolvers = new Map<string, (r: SettleResponse | null) => void>();

  /** Keys that identify one purchase. Exposed for diagnostics; never contains secrets. */
  keysFor(p: Payload): string[] {
    const auth = authorizationOf(p);
    if (!auth) return [];
    const from = auth.from.toLowerCase();
    const keys = [`auth:${p.accepted.network}:${p.accepted.asset.toLowerCase()}:${from}:${auth.nonce.toLowerCase()}`];
    const id = extractPaymentIdentifier(p as Parameters<typeof extractPaymentIdentifier>[0]);
    if (id) keys.push(`pid:${p.accepted.network}:${from}:${id}`);
    return keys;
  }

  attach(server: x402ResourceServer): this {
    // Exact replay of an already-settled payload: skip the facilitator (whose verify would now
    // reject the spent nonce) and let onBeforeSettle return the cached settlement.
    server.onBeforeVerify(async ({ paymentPayload }) => {
      const [authKey] = this.keysFor(paymentPayload);
      const entry = authKey ? this.entries.get(authKey) : undefined;
      if (entry?.state === "settled" && entry.signature === paymentPayload.payload["signature"]) {
        return { skip: true, result: { isValid: true, payer: entry.result.payer } };
      }
    });

    server.onBeforeSettle(async ({ paymentPayload }) => {
      const keys = this.keysFor(paymentPayload);
      for (const key of keys) {
        let entry = this.entries.get(key);
        if (entry?.state === "in_flight") {
          await entry.done;
          entry = this.entries.get(key);
        }
        if (entry?.state === "settled") return { skip: true, result: structuredClone(entry.result) };
        if (entry?.state === "indeterminate") {
          return { abort: true, reason: OUTCOME_UNKNOWN, message: "a previous settle for this purchase timed out; not settling again" };
        }
        if (entry?.state === "in_flight") {
          return { abort: true, reason: "duplicate_settlement_in_flight" };
        }
      }
      let resolve!: (r: SettleResponse | null) => void;
      const done = new Promise<SettleResponse | null>((r) => (resolve = r));
      for (const key of keys) {
        this.entries.set(key, { state: "in_flight", done });
        this.resolvers.set(key, resolve);
      }
    });

    server.onAfterSettle(async ({ paymentPayload, result }) => {
      const signature = String(paymentPayload.payload["signature"] ?? "");
      for (const key of this.keysFor(paymentPayload)) {
        const current = this.entries.get(key);
        // A skipped (cached) settle also runs this hook; keep the original entry.
        if (current?.state === "settled") continue;
        this.entries.set(key, { state: "settled", result: structuredClone(result) as SettleResponse, signature });
        this.finish(key, result as SettleResponse);
      }
    });

    server.onSettleFailure(async ({ paymentPayload, error }) => {
      const indeterminate = error instanceof FacilitatorTimeoutError;
      for (const key of this.keysFor(paymentPayload)) {
        if (this.entries.get(key)?.state !== "in_flight") continue;
        if (indeterminate) this.entries.set(key, { state: "indeterminate" });
        else this.entries.delete(key);
        this.finish(key, null);
      }
    });
    return this;
  }

  private finish(key: string, result: SettleResponse | null) {
    this.resolvers.get(key)?.(result);
    this.resolvers.delete(key);
  }
}
