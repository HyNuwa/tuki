# M4 — Verifier service, epochs, roots and claims

> Parent: [`mvp-p0.md`](mvp-p0.md) — modules 4 (pause), 7, 8 (rewards, backup, claim), 10, 13, Milestones row 4. Implements Q1 (relayed claim), Q6, Q7, Q9, Q13.4; PRD P0-07; error E10; invariants I4, I5, I10, I16. Contract interfaces: [`m1-contracts-gate.md`](m1-contracts-gate.md) §3 (final contracts derived from the M1 prototype).

## 1. Scope

`apps/verifier` (one deployable, run twice with separate keys and environments); the API's epoch builder, evidence-summary API, root relayer and claim relayer; the PWA reward screens, local encrypted leaf backup and self-claim; ledger projection from chain events.

## 2. Flows

- **Epoch build (API, every 2 h):** collects `verified_pending_commitment` entries; assigns `index`, random `leafSalt`; builds the reward tree (M1 §3.6) with ≤ `maxLeavesPerRoot` leaves; prepares `EpochRoot` payload and per-Task allocations. The contribution tree is built in M5; until then `contributionRoot = 0`.
- **Verifier review:** each verifier process pulls the batch through `GET /v1/verifier/batches/{epochId}` (evidence summaries, redacted copy via short signed URL, audited access, no contributor identity), checks it, and signs `EpochRoot` with its own key. No verifier key exists in `apps/api` or its environment.
- **Publication:** anyone (normally the API relayer) submits `publishRoot` with both signatures. Signatures and leaf hashes are served at `GET /v1/epochs/{epochId}` and are always rebuildable from the `RootPublished` event.
- **Quorum miss:** if both signatures are not present by the epoch deadline [Pending: grace period value], reserve stays locked, operators are alerted, `POST /v1/tasks` and quote return `paused`; nothing is auto-rejected (Q6).
- **Leaf delivery to contributor:** after the root is confirmed on chain, the PWA fetches its leaf preimage and proof, stores them encrypted on the device with a random key and offers an exportable recovery file. Tuki stores no secret derived from the wallet.
- **Claim:** relayed (`POST /v1/rewards/{epochId}/{index}/claim`, platform pays gas) or self-claim from the PWA calling `RewardVault.claim` directly.
- **Reconciliation:** any tx in state `unknown` is reconciled against chain events before retry (I5, E10); the ledger projection is rebuilt from events and checked against I10.

## 3. Acceptance criteria

| ID | Seam | Behaviour |
|---|---|---|
| M4-AC1 | Seam 1 + fork | Two verifier processes with distinct keys sign; root published; entries move to `committed_claimable`. |
| M4-AC2 | Seam 1 | The API alone (no verifier signature) cannot publish: the relayer refuses and the contract reverts on fork (I16, Q9). |
| M4-AC3 | Seam 1 | One verifier missing → quote and Task creation return `paused`; reserve stays locked; no entry rejected. |
| M4-AC4 | fork | With the API process stopped and the database dropped, a script using only chain events and the contributor's recovery file claims the reward (Q7). |
| M4-AC5 | fork | Relayed claim pays the recipient, not the relayer; double claim reverts. |
| M4-AC6 | Seam 1 | `unknown` publish or claim tx is reconciled, never resubmitted blindly (I5). |
| M4-AC7 | Seam 1 | Ledger: per contributor, accrued = claimed + committed-unclaimed + pending-root; vault balance identity holds after every scenario (I10). |
| M4-AC8 | Seam 1 | Evidence-summary API never returns contributor identity or the unredacted original; every access is logged. |
| M4-AC9 | Seam 1 | Accepted observations of a cancelled or expired Task still get a leaf (I4). |

## 4. Entry, exit, blocked (copied from the parent)

- **Entry:** Milestone 1 exit; milestone 3.
- **Exit (verifiable):** Two verifier processes with separate keys sign epochs; quorum miss pauses opening; claim succeeds with Tuki's API and database off, using chain events plus the contributor's backup.
- **Blocked when:** A claim requires any Tuki-held secret or service.

## 5. Edit surfaces

```text
apps/verifier/**
apps/api/src/epochs/**
apps/api/src/verifier-api/**
apps/api/src/relayer/**
apps/api/src/ledger/**
apps/api/src/db/schema/**
apps/api/drizzle/**
apps/api/test/**
apps/contributor-web/src/rewards/**
packages/contracts/src/**
packages/contracts/test/**
packages/domain/**
odd/specs/m4-verifier-epochs-claims.md
```

`packages/contracts` changes here only turn the M1 prototype into the final contracts; they get their own work-unit commit and an independent verification (parent Further Notes).

## 6. Dependencies

M1 exit and M3. M5 builds the contribution tree on top of the epoch build.
