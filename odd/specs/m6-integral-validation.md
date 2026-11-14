# M6 — Integral validation (INT-01, INT-02, final demo)

> Parent: [`mvp-p0.md`](mvp-p0.md) — "What is demonstrable" table, Testing Decisions (integration tests outside the suite), Milestones row 6. INT-01 and INT-02 are written at the start (M1 §8, M2a) and run progressively; this milestone makes them mandatory and green.

## 1. INT-01 — Mode A on Base Sepolia

Real `https://x402.org/facilitator`, faucet USDC, demo client buys `GET /v1/prices`: one settlement on chain, retry with the same `payment-identifier` does not settle again, insufficient coverage never settles. Records tx hashes.

## 2. INT-02 — Mode B on Base Sepolia

Through the API and demo client with deployed `TaskPolicy`/`RewardVault`: `openTask` → contributions → epoch root (2-of-2) → `registerDelivery` → capture after window → void remainder; a second Task taken through `reclaim` with the API stopped; a reward claim with the API and DB off. Records tx hashes. Test-only short timelines are labelled as such.

## 3. Final demo checklist

Each item of the parent's "Demonstrable in P0" row is shown working on Base Sepolia, plus Mode A, Mode B, failure scenarios and agent fund recovery (`void`, `reclaim`). Every simulated item is labelled "Simulated" on screen. Results in `reports/m6-integral-validation.md`.

## 4. Entry, exit, blocked (copied from the parent)

- **Entry:** All previous exits.
- **Exit (verifiable):** INT-01 and INT-02 pass on Base Sepolia; final demo shows Mode A, Mode B, failure scenarios, agent fund recovery (`void` and `reclaim`) and independent reward claim.
- **Blocked when:** Any demonstrable guarantee above fails on the real network.

## 5. Edit surfaces

```text
packages/demo-client/scripts/**
apps/api/test/int/**
packages/contracts/script/**
reports/m6-integral-validation.md
odd/specs/m6-integral-validation.md
```

## 6. Dependencies

M1–M5. Human prerequisites: funded wallets, deployed testnet contracts, verifier keys held by two team members.
