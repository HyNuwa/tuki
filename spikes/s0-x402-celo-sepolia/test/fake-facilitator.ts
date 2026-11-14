/**
 * FAKE facilitator for tests only. It never talks to a chain and never settles anything real.
 *
 * It implements the same `FacilitatorClient` interface the seller injects into
 * `x402ResourceServer`, so tests exercise the real @x402 middleware end to end. To keep the
 * fake honest it:
 *  - checks the EIP-3009 signature with viem (the payload must come from a real client signer),
 *  - checks amount / payTo / asset / network against the requirements,
 *  - simulates the on-chain rule that an EIP-3009 nonce can be used only once.
 * Settlement "transactions" are labelled `fake` and are not on any chain.
 *
 * Its `/supported` mirrors the real x402.org facilitator (observed 2026-11-13): it does NOT list
 * `payment-identifier`, so the idempotency tests prove the seller-side guard does not need it.
 */
import type { FacilitatorClient } from "@x402/core/server";
import type { PaymentPayload, PaymentRequirements, SettleResponse, SupportedResponse, VerifyResponse } from "@x402/core/types";
import { FacilitatorTimeoutError } from "@x402/core/server";
import { getAddress, isAddressEqual, keccak256, toHex, verifyTypedData, type Address, type Hex } from "viem";
import { BASE_SEPOLIA, type NetworkConfig } from "../src/network.ts";

export type FakeStep = "ok" | "reject" | "throw" | "timeout" | "fail";

type Authorization = { from: Address; to: Address; value: string; validAfter: string; validBefore: string; nonce: Hex };

export type FakeSettlement = { nonce: Hex; from: Address; to: Address; value: string; transaction: string };

const AUTH_TYPES = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

export class FakeFacilitatorClient implements FacilitatorClient {
  constructor(readonly network: NetworkConfig = BASE_SEPOLIA) {}

  readonly calls = { verify: 0, settle: 0, supported: 0 };
  /** Successful fake settlements, in order. Each one is a would-be on-chain transfer. */
  readonly settlements: FakeSettlement[] = [];
  private readonly usedNonces = new Set<string>();
  private readonly verifyPlan: FakeStep[] = [];
  private readonly settlePlan: FakeStep[] = [];
  /** Optional latency so tests can overlap concurrent requests. */
  settleDelayMs = 0;

  /** Queue behaviours for the next verify calls; afterwards verify behaves normally ("ok"). */
  planVerify(...steps: FakeStep[]): this {
    this.verifyPlan.push(...steps);
    return this;
  }

  /** Queue behaviours for the next settle calls; afterwards settle behaves normally ("ok"). */
  planSettle(...steps: FakeStep[]): this {
    this.settlePlan.push(...steps);
    return this;
  }

  async getSupported(): Promise<SupportedResponse> {
    this.calls.supported++;
    return {
      kinds: [{ x402Version: 2, scheme: "exact", network: this.network.caip2 }],
      extensions: ["builder-code", "eip2612GasSponsoring", "erc20ApprovalGasSponsoring"],
      signers: {},
    };
  }

  async verify(payload: PaymentPayload, requirements: PaymentRequirements): Promise<VerifyResponse> {
    this.calls.verify++;
    const step = this.verifyPlan.shift() ?? "ok";
    if (step === "throw") throw new Error("fake facilitator: transient verify error (503)");
    if (step === "timeout") throw new FacilitatorTimeoutError("verify", 10);
    const auth = payload.payload["authorization"] as Authorization | undefined;
    if (step === "reject") return { isValid: false, invalidReason: "fake_rejected_by_test", payer: auth?.from };
    return this.check(payload, requirements);
  }

  async settle(payload: PaymentPayload, requirements: PaymentRequirements): Promise<SettleResponse> {
    this.calls.settle++;
    if (this.settleDelayMs) await new Promise((r) => setTimeout(r, this.settleDelayMs));
    const step = this.settlePlan.shift() ?? "ok";
    const network = requirements.network;
    if (step === "throw") throw new Error("fake facilitator: transient settle error (503)");
    if (step === "timeout") throw new FacilitatorTimeoutError("settle", 10);
    const auth = payload.payload["authorization"] as Authorization;
    if (step === "fail") {
      return { success: false, errorReason: "fake_settle_failed_by_test", transaction: "", network, payer: auth.from };
    }
    const check = await this.check(payload, requirements);
    if (!check.isValid) return { success: false, errorReason: check.invalidReason, transaction: "", network, payer: auth.from };
    const nonceKey = auth.nonce.toLowerCase();
    if (this.usedNonces.has(nonceKey)) {
      // Mirrors EIP-3009: authorizationState(from, nonce) is already true on-chain.
      return { success: false, errorReason: "fake_nonce_already_used", transaction: "", network, payer: auth.from };
    }
    this.usedNonces.add(nonceKey);
    const transaction = keccak256(toHex(`fake-settlement:${nonceKey}`));
    this.settlements.push({ nonce: auth.nonce, from: auth.from, to: auth.to, value: auth.value, transaction });
    return { success: true, transaction, network, payer: auth.from, amount: auth.value, extra: { fake: true } };
  }

  private async check(payload: PaymentPayload, requirements: PaymentRequirements): Promise<VerifyResponse> {
    const auth = payload.payload["authorization"] as Authorization | undefined;
    const signature = payload.payload["signature"] as Hex | undefined;
    if (!auth || !signature) return { isValid: false, invalidReason: "fake_missing_authorization" };
    if (
      requirements.network !== this.network.caip2 ||
      !isAddressEqual(requirements.asset as Address, this.network.usdc.address) ||
      !isAddressEqual(auth.to, requirements.payTo as Address) ||
      auth.value !== requirements.amount
    ) {
      return { isValid: false, invalidReason: "fake_requirements_mismatch", payer: auth.from };
    }
    const valid = await verifyTypedData({
      address: getAddress(auth.from),
      domain: { ...this.network.usdc.eip712, chainId: this.network.chainId, verifyingContract: this.network.usdc.address },
      types: AUTH_TYPES,
      primaryType: "TransferWithAuthorization",
      message: {
        from: getAddress(auth.from),
        to: getAddress(auth.to),
        value: BigInt(auth.value),
        validAfter: BigInt(auth.validAfter),
        validBefore: BigInt(auth.validBefore),
        nonce: auth.nonce,
      },
      signature,
    });
    return valid ? { isValid: true, payer: auth.from } : { isValid: false, invalidReason: "fake_invalid_signature", payer: auth.from };
  }
}
