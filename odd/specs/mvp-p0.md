# Spec: MVP P0 — verified real-world commerce data marketplace for AI agents (Base Sepolia, minimized trust)

> Source of truth for this spec: docs 03, 04, 15, 16, ADR 0002 (verification), ADR 0003 (Base) and ADR 0004 (trust model, ratified 2026-11-14 for testnet), plus the grilling decisions Q1–Q13 of 2026-11-14 recorded below. Domain terms follow those docs: **DataProduct**, **Task**, **Contribution**, **Observation**, **Contributor**, **Agent** (buyer), **Verifier**. Testnet only: every screen and response is marked "DEMO — TESTNET, NO REAL MONEY".
>
> **Evidence tags:** **[Verified]** checked against source code, official docs or the chain; **[Design]** own decision, configurable, not yet implemented; **[Pending]** unverified fact or open blocker that must be resolved in the named experiment, never assumed to work; **[Simulated]** stands in for a real guarantee in the demo and is labelled as such.

## Problem Statement

AI agents (and the companies that run them) need real-world commerce facts that are not online: what a product actually costs at small physical stores in a region (first vertical: price paid and availability in traditional retail in the Argentine NOA). Today they can only get list prices from free public sources (SEPA) or expensive, slow retail panels that do not cover the traditional channel. An agent cannot programmatically discover whether such data exists, buy it on demand, or commission new observations when it does not exist yet.

When an agent does commission new data, it has no reason to trust the operator: it has to hand over its budget to a custodial account, believe that observations were really checked, and hope the unused budget comes back. On the other side, the people who contribute receipts have no enforceable guarantee they will be paid for accepted work, and their receipts contain personal data that must never reach the buyer.

## Solution

A marketplace with two modes, operated by the platform but with its critical powers limited by contracts on Base Sepolia and by verifiers who hold their own keys:

- **Mode A — buy existing data.** The agent browses a free catalog of DataProducts, checks coverage for free, and buys an aggregate per request with x402 `exact` in USDC. It pays only when the platform can deliver.
- **Mode B — commission new observations.** The agent quotes a Task, authorises its budget into the already-deployed `AuthCaptureEscrow`, and gets a deliverable aggregate when enough verified observations arrive. The platform **cannot capture the budget on its own**: the escrow operator is the `TaskPolicy` contract, which only captures after the dispute window, with a 2-of-2 verifier decision and no open dispute. If the platform disappears, the agent recovers its budget with `reclaim` after `authorizationExpiry`.
- **Contributors** sign in with their wallet, accept versioned consent terms, upload a receipt photo to an open Task and follow its status. Every accepted observation earns a reward backed by reserve locked on chain in `RewardVault` when the Task opens; once its epoch root is published, the reward is claimable with a Merkle proof even if Tuki's servers are off.
- **Privacy by construction.** Buyers receive only aggregates above the demo thresholds (k distinct contributors, m distinct stores) with quality metadata, a provenance receipt and verifier signatures, never images, individual observations or contributor identifiers. Nothing personal goes on chain.

## Decisions from the grilling session (2026-11-14)

These are normative for implementers. Values marked [Design] are configurable defaults for the testnet demo.

| ID | Topic | Decision |
|---|---|---|
| Q1 | Contributor identity and wallet | Sign-In with Ethereum (EIP-4361) behind a `ContributorAuth` port for the demo; an embedded wallet (for example CDP) for a later pilot. The platform relays reward claims gasless; the contributor can always self-claim with the Merkle proof if the platform is down. |
| Q2 | Agent authentication for Task routes | EIP-712 request signature by the escrow `payer` (the Task owner; a refund never changes the owner). Message `{taskId, method, path, queryHash, bodyHash, nonce, deadline}`, `deadline` ≤ 5 min ahead, one-time `nonce` consumed atomically in PostgreSQL. EOA (`ecrecover`), ERC-1271 and ERC-6492 signatures accepted. Idempotency keys for mutating retries. Catalog, coverage and quote stay public. A signature authenticates; it does not encrypt. Only opaque ids and commitments go on chain. |
| Q3 | Demo vertical | No hard-coded locality or product list. Products are identified by EAN or by a normalised description matched against the SEPA catalog; zones are configurable cells. Any real team receipt can be ingested. Aggregation is exercised with synthetic fixtures flagged `synthetic`, which are never sold and never enter a deliverable result. A commercial demo cell is chosen later. k = 5 and m = 3 are demo parameters, not reduced and not presented as a statistical anonymity guarantee. |
| Q4 | Naming and EIP-712 domain | Technical provisional name `tuki`; the project is not "Halo". EIP-712 domain `{name: "Tuki Protocol", version: "1", chainId, verifyingContract}`, stable across rebranding. The product name shown in UI is configuration. |
| Q5 | Testnet economics (atomic USDC, 6 decimals, no floats, gas separate) | Price per deliverable observation 1.00 USDC (`1000000`); fee 30 % (3000 bps, taken at capture within the escrow's `minFeeBps`/`maxFeeBps`); reward per accepted observation 0.50 USDC; reserve contribution 0.20 USDC; Mode A price 0.01 USDC per request; initial reserve 20 USDC funded by the team. Each Task declares `maxRewardedObservations`; on open, `TaskPolicy` locks `maxRewardedObservations × reward` from `RewardVault` free reserve and the Task does not open if the free reserve is insufficient. `RewardVault` allocates rewards against that lock. |
| Q6 | When a reward is guaranteed | Only when a 2-of-2 signed root is registered on chain with funds locked and the leaf is claimable. Observation reward states: `verified_pending_commitment → committed_claimable → claimed`. Epochs of 2 h [Design]. If quorum is not reached in time: reserve stays locked, operators are alerted, new Task opening pauses; nothing is auto-rejected. Anyone can publish a root that carries valid signatures. Signatures and proofs are available independently of Tuki. Roots are immutable per epoch, domain-separated, with double-claim protection. |
| Q7 | Merkle leaves | Events carry only the ordered `leafHashes`, the root and the signatures. The private leaf is `(epochId, index, recipient, amountAtomic, leafSalt)` hashed with domain separation and a secret random salt. The contract checks that the published hashes rebuild the root. Anyone can rebuild proofs from events. The contributor keeps the leaf plus a backup encrypted locally with a random key and an exportable recovery file; Tuki stores no secret for it and no key is derived from wallet signatures. A leaf counts as claimable only when its root is confirmed, funds are locked and the recipient has access to a recoverable leaf. Batch size limited; gas measured; a claim is tested with Tuki's infrastructure off. |
| Q8 | Disputes and capture | Capture only after the agent dispute window and with a final valid decision. Separate deadlines: `disputeDeadline`, `authorizationExpiry` (capture limit) and `refundExpiry`. Dispute window 48 h [Design] starting at effective delivery (Q13). Bounded resolution before `authorizationExpiry`. `TaskPolicy` is the effective operator; Tuki cannot capture or ignore a dispute unilaterally. Disputes are registered directly on `TaskPolicy`, without Tuki's API. Unresolved → the agent keeps `reclaim`. Rewards come from the reserve; a later capture replenishes it and pays the fee. **No refund after capture in the MVP.** Accepted residual risk: the agent obtains the result and then reclaims its budget. |
| Q9 | Verifiers | 2-of-2, two separate keys held by two team members. Their independence is explicitly **limited** (both are Tuki people). Verifiers see redacted evidence through temporary, audited access. No verifier key exists in the backend. A test proves the operator cannot approve a root alone. A missing signature triggers the Q6 pause. The verifier set changes only by redeploying (no upgradeable governance). A future 2-of-3 must not allow a quorum made only of Tuki people. |
| Q10 | Toolchain | pnpm monorepo: `apps/api`, `apps/contributor-web`, `apps/verifier`, `packages/contracts`, `packages/domain`, `packages/demo-client`. Foundry (unit, fuzz/invariants, gas, fork of `AuthCaptureEscrow` v1.1, real Base Sepolia integration, with focus on Q7 leaf publication and Q8 dispute/capture). PostgreSQL 16 + Drizzle with the same major in dev, CI and deploy; Testcontainers for real concurrency tests. React + Vite PWA with wagmi/viem. Vision LLM chosen in S3 behind `Extractor`. Cloudflare R2 only for private evidence (temporary access, encryption, deletion); it does not replace a future decentralised layer. TypeScript strict + vitest; Solidity 0.8.x. Verifiers share the public monorepo code but run separately with their own keys and environments. On-chain financial state stays separate from PostgreSQL projections. Versions of dependencies and tools are pinned. No other technologies. |
| Q11 | EXIF and personal data | EXIF is processed in memory on upload; only three booleans are kept (`hasCameraExif`, `softwareTagPresent`, `captureTimeConsistent`); metadata is stripped from every persisted image, including the encrypted original; GPS is never stored; missing EXIF never causes an automatic rejection. Redaction happens on the server, with sensitive-data preprocessing before an image is sent to an external LLM where possible, and an explicit evaluation of the provider's image retention. Redaction is selective (no blanket header/footer blur, which could remove fiscal data needed for L1); uncertainty goes to manual review. Reviewers and verifiers see only the redacted copy; the unredacted original is encrypted, EXIF-free, kept only for authorised audits, with logged access and limited retention. S3 measures personal-data false negatives and loss of information needed to verify the ticket; receipts that cannot be redacted reliably never go automatically to external review. |
| Q12 | Build order | Risk-ordered milestones without dates (see Milestones). |
| Q13 | Final parameters [Design] | (1) Max 3 rewarded observations per Task per contributor identity; in the demo the wallet is a provisional identifier with no anti-sybil guarantee. (2) Dispute resolution bound: 24 h after `disputeDeadline`; `authorizationExpiry` covers every period plus an operational margin. (3) The agent's dispute window starts with the effective delivery of the result. (4) 256 leaves per published root is an initial limit subject to W2 gas measurements, not a guaranteed capacity. (5) Contributors appeal a rejection off chain within 48 h of the rejection notice; reserve coverage is kept while an appeal is pending. On-chain disputes, which block capture, are opened only by the agent (`payer`). |

### What is demonstrable, simulated, at risk and pending

| Category | Items |
|---|---|
| **Demonstrable in P0 (must be shown working)** | Agent pays at most its authorised maximum (escrow); capture without the 2-of-2 decision reverts; capture during the dispute window or with an open dispute reverts; agent `reclaim` after `authorizationExpiry` with Tuki offline; reward claim from `RewardVault` with Tuki offline using only chain events and the contributor's backup; a root cannot be published with one signature; double claim reverts; Task does not open without free reserve; Mode A charges only on delivery and never twice for the same payment identifier; no personal data or images on chain or in buyer responses. |
| **Simulated or limited in P0** | Verifier independence (two team members, "limited independence"); contributor identity (wallet only, no anti-sybil); reserve funded by the team on testnet; synthetic fixtures for aggregation (never sold); facilitator and extractor faked in the automated suite (real ones only in INT-01 and S3); fiscal verification reaches L1 + L3 (L2 ARCA constatation stays spike S4). |
| **Residual risks (documented, accepted for testnet)** | Agent obtains the result during the dispute window and then reclaims (Q8); both verifiers are Tuki people and could collude (Q9); delivery start is registered by Tuki-side signers (Q13.3); a contributor who loses the leaf backup cannot claim once Tuki is gone (Q7); reward claims are public on chain and link a wallet to reward frequency (mitigated by 2 h epochs); `AuthCaptureEscrow` is third-party code; redaction false negatives and LLM provider retention (Q11); `TaskPolicy`/`RewardVault` are unaudited own code. |
| **Pending experiments** | W1, W2 (milestone 1 gate), S3 (milestone 2), W3 (milestone 5), INT-01, INT-02 (milestone 6). Outside P0: S4 (ARCA), S7 (MeID), S8 (Lighthouse/Filecoin/PDP, conditioned on its five proofs). |

## User Stories

### Agent — discovery (Mode A and B)

1. As an agent, I want to list DataProducts for free, so that I can learn what data exists before spending anything.
2. As an agent, I want each DataProduct to declare coverage (zone cells, store kinds, store count, product identifiers by EAN or normalised description), so that I can decide if it answers my question.
3. As an agent, I want each DataProduct to declare freshness and observation window, so that I do not buy stale data.
4. As an agent, I want each DataProduct to declare its origin (receipt or shelf photo) and minimum verification level (L0–L3), so that I know how much to trust it.
5. As an agent, I want each DataProduct to declare observation and contributor counts, so that I can judge statistical weight.
6. As an agent, I want each DataProduct to declare its licence and price in atomic USDC units, so that I know what I can do with it and what it costs.
7. As an agent, I want a free coverage check for a specific product and zone cell, so that I avoid paying for a cell without enough data.
8. As an agent, I want products below the privacy thresholds and synthetic fixtures to never be listed for sale, so that published counts never undercut privacy and I never buy test data.
9. As an agent, I want to discover the service through `/.well-known/x402`, the REST catalog or the MCP `list_products` tool, so that I can integrate in whatever way my framework supports.
10. As an agent, I want discovery to work without any payment setup or signature, so that browsing is independent of the payment rail.

### Agent — Mode A purchase

11. As an agent, I want a paid data request to answer `402 Payment Required` with exact x402 requirements (scheme `exact`, network `eip155:84532`, USDC asset, amount `10000`, pay-to), so that my x402 client can pay automatically.
12. As an agent, I want to receive the aggregate and a decoded payment response after paying, so that I have the data and proof of payment.
13. As an agent, I want the platform to refuse before charging when it already knows it cannot deliver (no coverage, below thresholds), so that I never pay for nothing.
14. As an agent, I want a retry with the same payment identifier to return the already-paid result without charging again, so that network failures never double-charge me.
15. As an agent, I want a replay of the same signed authorization to be rejected or answered from cache, so that a leaked header cannot be used to charge me twice.
16. As an agent, I want a credit recorded when a settled payment cannot be delivered, so that the platform owes me what I paid.
17. As an agent, I want expired, wrong-amount or wrong-network payments to be rejected with a clear reason, so that I can fix my client.
18. As an agent, I want a facilitator outage to fail the request without a partial charge and with a retryable error, so that I can try later.
19. As an agent, I want repeated or overlapping queries that could isolate an individual observation to be limited or suppressed, so that the marketplace is not usable for re-identification.

### Agent — Mode B task lifecycle

20. As an agent, I want to quote a Task for free with zone cell, products, observation window, acceptance criteria and deadline, so that I see feasibility, price per deliverable observation, `maxRewardedObservations`, suggested budget and partial-result policy before committing.
21. As an agent, I want the quote to state `deadline`, the maximum delivery time, `disputeDeadline` rule (48 h after effective delivery), the 24 h resolution bound, `authorizationExpiry`, `refundExpiry`, the fee bps and the partial policy, so that the rules are fixed before I fund.
22. As an agent, I want the quote to warn or refuse when the Task is unlikely to reach its minimum quorum or when the free reserve cannot cover its rewards, so that I do not lock funds in a Task that will fail.
23. As an agent, I want to fund a Task by signing an ERC-3009 authorization for `AuthCaptureEscrow` with a maximum equal to my budget, so that my funds sit in a contract and not in a platform account.
24. As an agent, I want the escrow operator to be the published `TaskPolicy` contract and the receiver to be `RewardVault`, so that I can verify which rules gate the capture of my funds.
25. As an agent, I want the Task to open only after the escrow authorization and the reserve lock are confirmed on chain, so that no work starts without real funding and real reward coverage.
26. As an agent, I want to read the Task status (open, filling, deliverable, delivered, disputed, captured, closed, expired, cancelled) with my EIP-712 request signature, so that only the Task owner sees its progress.
27. As an agent, I want my request signatures to expire within 5 minutes and be single-use, so that a leaked signature cannot be replayed.
28. As an agent, I want to sign requests with an EOA, a smart account (ERC-1271) or a not-yet-deployed smart account (ERC-6492), so that any wallet type can own a Task.
29. As an agent, I want the Task to stop accepting rewarded observations when `maxRewardedObservations` is reached, so that my budget and the reserve lock can never be exceeded.
30. As an agent, I want to be charged only for deliverable results, so that accepted-but-undeliverable observations are not my cost.
31. As an agent, I want the capture amount to be at most what the verifiers' signed decision states and never above my authorised maximum, so that the platform cannot overcharge.
32. As an agent, I want capture to be impossible before `disputeDeadline`, so that I always have the full window to check the result.
33. As an agent, I want to open a dispute directly on `TaskPolicy` before `disputeDeadline`, so that I can block capture without depending on Tuki's API.
34. As an agent, I want an open dispute to block capture until a 2-of-2 resolution is registered, and an unresolved dispute to leave me `reclaim`, so that disputes cannot be ignored.
35. As an agent, I want the unused budget released with `void` when the Task closes, so that I get my money back without asking.
36. As an agent, I want to `reclaim` my authorised funds myself after `authorizationExpiry` if the platform stops responding, so that I never depend on the operator to recover them.
37. As an agent, I want a Task that expires below the minimum quorum to return 100 % of the budget unless I accepted partial results in the quote, so that incomplete work is not charged.
38. As an agent, I want to cancel a Task and get the unused budget back under the rules published in the quote, so that I can change my mind.
39. As an agent, I want to download the Task result (aggregate, quality metadata, `resultHash`, provenance receipt, verifier signatures) at no extra cost, so that delivery is part of what I pay for.
40. As an agent, I want the result to declare verification level, observation and contributor counts, period, suppressions, `groundTruthScore` and price conflicts, so that I can judge quality.
41. As an agent, I want the default licence of commissioned data to be `task_only`, so that what I commissioned is not resold to others.

### Contributor

42. As a contributor, I want to sign in with my wallet (SIWE), so that I need no password and my rewards go to an address I control.
43. As a contributor, I want to read and accept versioned consent terms (purpose, licence scope, what cannot be recalled), so that I know how my data is used before uploading.
44. As a contributor, I want to see open Tasks near me and what each one pays per accepted observation, so that I can choose where to contribute.
45. As a contributor, I want to upload a receipt photo to a Task, so that I can earn a reward.
46. As a contributor, I want to see my contribution status (verifying, accepted, rejected with reason, in review), so that I know what happened.
47. As a contributor, I want a clear rejection reason (duplicate, illegible, total mismatch, out of Task criteria, quota full, contributor cap reached), so that I can retry correctly.
48. As a contributor, I want to appeal a rejection within 48 h of being notified, with the reserve kept for my observation while the appeal is pending, so that a wrong rejection can be corrected.
49. As a contributor, I want to retry after an extraction failure, so that a bad photo does not cost me the reward.
50. As a contributor, I want every accepted, non-revoked observation to be paid even if the Task ends without a deliverable result or the agent cancels, so that my work is never lost.
51. As a contributor, I want to see each reward's state (`verified_pending_commitment`, `committed_claimable`, `claimed`), so that I know when it is really guaranteed.
52. As a contributor, I want my reward leaf and proof stored in a backup encrypted on my device with a random key and an exportable recovery file, so that I can claim even if Tuki disappears.
53. As a contributor, I want to claim gasless through the platform relayer or by myself with the Merkle proof, so that I can always collect.
54. As a contributor, I want rewards committed in 2 h epochs rather than one transfer per receipt, so that my on-chain history reveals less about my shopping habits.
55. As a contributor, I want a cap of 3 rewarded observations per Task, so that one contributor cannot dominate a Task (and I understand why I was capped).
56. As a contributor, I want to withdraw consent at any time, so that my observations leave future aggregates and sales.
57. As a contributor, I want to be told that results already delivered cannot be recalled and that committed rewards are not reversed, so that withdrawal has no surprises.
58. As a contributor, I want my name, document number, CUIT and card digits redacted on the server before any reviewer or verifier sees the image, so that my personal data is protected.
59. As a contributor, I want EXIF (including GPS) stripped from every stored image, so that the platform keeps only what it needs.

### Verifier

60. As a verifier, I want to receive a batch with evidence summaries (checks, levels, extraction confidence, EXIF booleans) and redacted images through temporary, audited access, without contributor identity, so that I can judge validity without seeing personal data.
61. As a verifier, I want to sign typed EIP-712 decisions (epoch reward root, delivery record, capture decision, dispute resolution) under the "Tuki Protocol" domain, so that my approval is attributable and machine-checkable.
62. As a verifier, I want each signature valid only for its chain, contract, Task or epoch and nonce, so that it cannot be replayed elsewhere.
63. As a verifier, I want to run my own process with my own key and environment, so that the API never holds my key.
64. As a verifier, I want the contracts to require both signatures, so that neither I alone nor the platform decides.
65. As a verifier, I want to resolve disputes with a signed decision within 24 h of `disputeDeadline`, so that captures follow the same accountability.

### Platform operator

66. As the operator, I want the pipeline to decode the ARCA fiscal QR before any LLM call, so that issuer, date, total and authorization code are read exactly and for free.
67. As the operator, I want duplicates rejected by fiscal key `(cuit, ptoVta, tipoCmp, nroCmp)` and exact `sha256`, and near-duplicates (`pHash` within threshold) sent to review, so that the same receipt is never paid twice.
68. As the operator, I want extraction by a vision LLM with schema-validated JSON and deterministic checks (sum of items = total = QR amount), so that invented prices are rejected or reviewed, never accepted by default.
69. As the operator, I want ambiguous cases and receipts that cannot be redacted reliably routed to internal manual review, never automatically to external review, so that humans handle exceptions without exposing personal data.
70. As the operator, I want aggregates published only with ≥ k distinct contributors and ≥ m distinct stores (demo: k = 5, m = 3), with single-store suppression and time/location rounding, so that no individual can be re-identified.
71. As the operator, I want each accepted observation committed as a salted evidence leaf and each result as a Merkle `evidenceRoot` in a signed receipt, anchored on Base, so that buyers and auditors can check integrity without seeing tickets.
72. As the operator, I want a double-entry ledger that projects on-chain escrow and vault state plus off-chain obligations per Task, so that budget = captured + voided + held and reserve = free + locked at all times.
73. As the operator, I want the task engine to pause opening new Tasks when the free reserve cannot cover a new lock or when an epoch misses quorum, so that contributor guarantees stay solvent.
74. As the operator, I want transactions whose on-chain result is unknown to be reconciled against the chain before any retry, so that nothing is executed twice.
75. As the operator, I want fraud detected before commitment to revoke an observation and remove it from aggregates, so that losses are contained (committed rewards are not clawed back).
76. As the operator, I want no secrets in clients and no personal data or images on chain or in logs, so that the demo meets its privacy and security floor.
77. As the operator, I want every state change and payment to be idempotent and recoverable after a restart, so that crashes do not corrupt money flows.
78. As the operator, I want a rule-based demo client (no LLM) that discovers, decides, pays and consumes results for both modes and exercises failure scenarios, so that the demo runs end to end without manual steps except review.
79. As the operator, I want p50/p95 metrics for extraction time and time-to-result, plus the manual review rate and the redaction false-negative rate, so that we measure operational cost without promising unmeasured thresholds.

## Implementation Decisions

### Architecture and trust (ADR 0003, ADR 0004)

- Network: Base Sepolia (`eip155:84532`), USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (name `USDC`, version `2`, 6 decimals) [Verified]. One active network behind `PaymentRail`; storage is independent of the payment chain.
- Source of truth for funds is on-chain state (`AuthCaptureEscrow`, `TaskPolicy`, `RewardVault`). PostgreSQL is the operational projection: coordination, deduplication, indexing and the ledger; it never authorises a fund movement by itself.
- The ADR 0004 powers matrix is normative. The platform alone may publish the catalog, sell Mode A data, reject or review observations and `void` (which only favours the agent). Capture, delivery records, dispute resolutions and reward roots require the 2-of-2 verifier signatures. The agent can always `reclaim` after `authorizationExpiry`. Contributors can claim committed rewards from `RewardVault` without the API.
- `AuthCaptureEscrow` v1.1 at `0xf96815976523E00e65Be8f34cA5e64b4f41EB19c` on Base Sepolia [Verified]: `authorize`, `capture`, `void`, `refund` and `charge` require `msg.sender == paymentInfo.operator`; the operator may be a contract; `reclaim` only by the payer after `authorizationExpiry`. The ERC-3009 token collector address on Base Sepolia and the exact capture fee parameters are [Pending] and are confirmed in W1 before any contract code depends on them.

### Task timeline [Design]

```text
quote ── open (authorize + reserve lock) ── deadline ── delivery (≤ deadline + maxDeliveryDelay)
      ── disputeDeadline = delivery + 48 h ── resolutionDeadline = disputeDeadline + 24 h
      ── authorizationExpiry = deadline + maxDeliveryDelay + 48 h + 24 h + operationalMargin
      ── refundExpiry = authorizationExpiry (no refund after capture in the MVP)
```

Demo defaults: `maxDeliveryDelay` 24 h, `operationalMargin` 24 h. All values are fixed at quote time and hashed into the Task terms that `TaskPolicy` stores at open; they cannot be changed unilaterally. A delivery after `deadline + maxDeliveryDelay` is rejected by `TaskPolicy`; the agent then reclaims or Tuki voids.

### Modules

1. **Catalog & discovery** — DataProduct contract, coverage check, `/.well-known/x402`, MCP `list_products`. Knows prices as data; no dependency on the payment rail. Never lists products below k/m or synthetic fixtures.
2. **Mode A payments** — x402 `exact` through `https://x402.org/facilitator` (no API key; lists `exact` on `eip155:84532` [Verified]) using `@x402/*` 2.31.0 and Hono, as in spike S0. Idempotency guard (EIP-3009 nonce key; payer + `payment-identifier` key; in-flight serialisation; refuse-after-uncertain-settle) moves from memory to PostgreSQL with unique constraints. The paid handler has no irreversible effects before settlement. Uncertain settles are reconciled on chain by the authorization-used event before deciding, as in the official Celo example.
3. **Agent request auth** — Q2. Verifies the EIP-712 request signature against the Task's escrow `payer`, checks `deadline`, consumes the nonce in PostgreSQL in the same transaction as the request effect, binds method, path, query hash and body hash.
4. **Task engine** — quote, open, per-store/day quotas, `maxRewardedObservations`, per-contributor cap (3), acceptance criteria, minimum and target quorum, timeline above, close, expiry, cancellation, `paused` when the free reserve is short or an epoch misses quorum.
5. **Escrow adapter (Mode B funding)** — `PaymentInfo`: payer = agent, operator = `TaskPolicy`, receiver = `RewardVault`, token = USDC, `maxAmount` = budget, expiries from the timeline, `minFeeBps = maxFeeBps = 3000`, `feeReceiver` = platform fee address, salt = Task-derived. The agent signs the ERC-3009 authorization off chain; anyone (normally the platform relayer, paying gas) submits it through `TaskPolicy.openTask`. Mode B does not use any x402 facilitator in P0 (the testnet facilitator does not list `auth-capture` [Verified]).
6. **TaskPolicy contract (new, Solidity)** — the escrow `operator`. Non-upgradeable; verifier set and threshold (2-of-2) fixed at deployment. Functions:
   - `openTask(paymentInfo, collectorData, terms)`: stores the terms hash, calls `authorize`, asks `RewardVault` to lock `maxRewardedObservations × reward`; reverts if the lock fails.
   - `registerDelivery(taskId, resultHash, evidenceRoot, signatures)`: 2-of-2 signed delivery record; sets `deliveredAt` and `disputeDeadline`; rejects late deliveries.
   - `openDispute(taskId, reasonHash)`: only the `payer`, only before `disputeDeadline`.
   - `resolveDispute(taskId, decision, signatures)`: 2-of-2, before `resolutionDeadline`; outcome is a capture amount (possibly zero).
   - `capture(taskId, decision, signatures)`: only after `disputeDeadline`, only with no unresolved dispute, amount ≤ signed amount ≤ `maxAmount`; captured funds go to `RewardVault` (net) and `feeReceiver` (fee). Then voids the remainder and releases the unused reserve lock.
   - `void(taskId)`: callable by the platform at any time (favours the agent); releases the unused reserve lock.
   - Rejects reused nonces, expired decisions, decisions for another Task, chain or contract, and any single-signature decision.
7. **RewardVault contract (new, Solidity)** — the escrow `receiver` and holder of the pre-funded reserve. Tracks `freeReserve` and `locked[taskId]`; `lock`/`release` callable only by `TaskPolicy`. `publishRoot(epochId, leafHashes[], taskAllocations[], signatures)` is permissionless with valid 2-of-2 signatures: rebuilds the root from the ordered leaf hashes, checks the signatures over `{epochId, root, leafCount, totalAmount, taskAllocations}`, debits each Task's lock, emits the leaf hashes; one immutable root per epoch; ≤ 256 leaves per root initially (Q13.4). `claim(leaf, proof)` is permissionless and always pays `leaf.recipient`; each leaf claims once. Leaf hash: `keccak256(abi.encode(LEAF_TYPEHASH, chainId, vault, epochId, index, recipient, amountAtomic, leafSalt))` [Design]. Captured funds increase `freeReserve`.
8. **Contributor auth, API and web app (PWA)** — SIWE behind `ContributorAuth`; versioned consent per purpose and licence scope; open Tasks; upload; status; appeals (48 h); reward states; local encrypted leaf backup with exportable recovery file; claim (relayed or self); consent withdrawal. Contributor identity (wallet) lives in a table separated from observations. No identity-provider integration in P0.
9. **Ingestion pipeline** — screening; EXIF processed in memory to three booleans and stripped (Q11); fiscal QR decode (ARCA JSON in Base64; drop `tipoDocRec`/`nroDocRec`); `sha256` + `pHash` dedupe; sensitive-data preprocessing before the external LLM where possible; `Extractor` (vision LLM, schema JSON, confidence, model version, PII bounding boxes); deterministic checks; selective server-side redaction producing the review copy; layers L0–L3 (P0 reaches L1 + L3); internal review queue for uncertainty.
10. **Verifier service** — separate deployable run by each key holder with its own key and environment; reads batches through an evidence-summary API (redacted copy, temporary audited access, no contributor identity); signs epoch roots, delivery records, capture decisions and dispute resolutions. Never shares keys with the API.
11. **Aggregation & privacy** — k = 5, m = 3 (demo parameters), single-store suppression, day/week and cell rounding, query budget and global overlap checks; `synthetic` fixtures excluded from anything sold.
12. **Provenance (W3)** — salted evidence leaf `H(salt ‖ evidenceDigest ‖ observationId ‖ level ‖ extractionHash)`, Merkle `evidenceRoot` per result, signed receipt in an append-only hash-chained log, anchored on Base through the `registerDelivery` event. Formats and events are frozen in milestone 2 so the data model and contracts agree; full integration in milestone 5.
13. **Ledger** — double-entry entries for budgets held, captures, voids, reserve (free, locked, released), rewards (pending commitment, committed, claimed), fees and Mode A credits; projection reconciled from chain events; integers in atomic units.
14. **Object storage** — Cloudflare R2 private bucket, encrypted objects, short signed URLs, scheduled deletion; review copy and encrypted original (both EXIF-free) as separate objects. Retention: until the later of Task closure, last appeal and last dispute resolution, plus 7 days [Design; legal review pending].
15. **MCP server** — thin layer over the same services: `list_products`, coverage, paid purchase tool, quote/create/status/result for Tasks; structured commerce-observation schemas only.
16. **Demo client** — rule-based agent (no LLM) for Mode A and Mode B, using `@x402/fetch` with spend controls, an ERC-3009 escrow-signing helper, the EIP-712 request signer and scripted failure scenarios (dispute, reclaim, quorum miss).

### API contract (REST)

- Public: `GET /v1/products`, `GET /v1/products/{id}`, `GET /v1/coverage`, `POST /v1/tasks/quote`, `/.well-known/x402`.
- Paid (x402 `exact`): `GET /v1/prices` and product data routes.
- Mode B, owner-signed (Q2): `POST /v1/tasks` (returns the `PaymentInfo` and terms to sign; the Task opens after the on-chain `openTask` is confirmed), `GET /v1/tasks/{id}`, `GET /v1/tasks/{id}/result` (included in the budget), `POST /v1/tasks/{id}/cancel`. Disputes are opened on chain; the API only mirrors their state.
- Contributor (SIWE session): consent, nearby Tasks, contribution upload/status, appeals, rewards and proofs, consent withdrawal.
- Public proof data: epoch roots, leaf hashes and signatures are served by the API for convenience but are always reconstructible from chain events.

### Data model

- `DataProduct`, `Task` (terms hash, timeline fields, `maxRewardedObservations`, `maxPerContributor`, quorum, `partialAccepted`), `Contribution`, `Observation` (states `accepted → aggregation_eligible → deliverable`, plus `rejected`, `in_review`, `appealed`, `revoked`, `withdrawn`; `synthetic` flag), `RewardEntry` (states `verified_pending_commitment`, `committed_claimable`, `claimed`), `Epoch`, verifier decisions (kind, payload hash, signatures, nonce), `MediaRef` (review copy and encrypted original, `evidenceDigest`, key id, EXIF booleans), agent request nonces, ledger entries.
- Uniques: fiscal key, `sha256`, `payment-identifier` per payer, EIP-3009 nonce, agent request nonce, decision nonce, leaf `(epochId, index)`.

### Milestones (Q12) — risk-ordered, no dates

No milestone may present an on-chain guarantee as working while it is simulated or failing. INT-01 and INT-02 are written at the start and run progressively; milestone 6 is the integral validation, not the first integration.

| # | Milestone | Entry | Exit (verifiable) | Blocked when |
|---|---|---|---|---|
| 1 | **Contract viability gate (W1, W2)** — prototype `TaskPolicy` and `RewardVault` against the real `AuthCaptureEscrow` v1.1 and ERC-3009 collector, before final contracts | Foundry installed; Base Sepolia RPC; faucet USDC | On fork and on Base Sepolia: authorize → capture with 2-of-2 after the window; capture without signatures, with one signature, in the window or with an open dispute reverts; `reclaim` with Tuki offline; root publication with Q7 leaves; claim with Tuki offline; double claim reverts; invariants and fuzzing green; gas per root measured and the leaf limit set | The collector or escrow rejects a contract operator, ERC-3009 cannot be relayed through `TaskPolicy`, or root publication at a useful batch size exceeds gas limits. Record the blocker in this spec and stop Mode B contract work |
| 2 | **Domain, API and Mode A in parallel; S3 early; W3 formats frozen** | Monorepo skeleton; PostgreSQL 16 via Testcontainers | Catalog, coverage, quote and Mode A purchase pass Seam 1 tests; idempotency guard on PostgreSQL; S3 report on team receipts with extraction accuracy, redaction false negatives and fiscal-data loss; evidence leaf, receipt and delivery event formats documented | S3 shows extraction or redaction not reliable even with manual review at reasonable cost |
| 3 | **Ingestion and extractor** | S3 report; `Extractor` provider chosen | Upload → EXIF booleans and strip → QR → dedupe → extraction → checks → redacted review copy → accept/reject/review, all through the public API; appeals | Redaction cannot keep personal data out of the review copy |
| 4 | **Verifier service, epochs, roots and claims** | Milestone 1 exit; milestone 3 | Two verifier processes with separate keys sign epochs; quorum miss pauses opening; claim succeeds with Tuki's API and database off, using chain events plus the contributor's backup | A claim requires any Tuki-held secret or service |
| 5 | **Aggregation, provenance (W3), MCP and demo client** | Milestones 2–4 | k/m and overlap checks; signed receipt and `evidenceRoot` anchored via `registerDelivery`; MCP tools; demo client runs both modes and failure scenarios | — |
| 6 | **Integral validation** | All previous exits | INT-01 and INT-02 pass on Base Sepolia; final demo shows Mode A, Mode B, failure scenarios, agent fund recovery (`void` and `reclaim`) and independent reward claim | Any demonstrable guarantee above fails on the real network |

Buyer and demand validation runs in parallel from the start (doc 14) and does not wait for the build.

## Testing Decisions

- **Good tests check external behaviour only:** HTTP responses (status, body, headers including `payment-required` / `payment-response`), persisted state visible through the API, chain state, events and balances. No assertions on private functions or internal call order. Each rule's test asserts every observable effect.
- **Seam 1 — HTTP application in process.** The Hono app is called with in-process requests. Fakes only at external adapters: x402 facilitator (prior art: the spike's fake facilitator), `Extractor` (fixed JSON per fixture receipt), object storage (in memory), clock, and a chain gateway fake for API-level tests. PostgreSQL 16 is real via Testcontainers (unique constraints back dedupe, nonces, idempotency and ledger invariants; concurrency tests run against it). Covers P0-01..P0-10 and error scenarios E1–E12 from doc 03, plus Q2 request auth (expired, replayed, wrong owner, ERC-1271).
- **Seam 2 — contracts (Foundry).** Unit, fuzz and invariant tests on a fork of Base Sepolia with the deployed `AuthCaptureEscrow` and USDC: full lifecycle; reserve lock at open and failure when insufficient; capture only after `disputeDeadline` with 2-of-2 and no open dispute; single-signature and operator-only attempts revert; replayed, expired and foreign decisions revert; capture above the signed amount reverts; dispute only by payer and only in the window; unresolved dispute leaves `reclaim`; `reclaim` with the platform offline; root rebuilt from published leaf hashes; claim with proof pays only the recipient; double claim reverts; gas per root measured. Invariants: `freeReserve + Σ locked + Σ committed-unclaimed = vault USDC balance`; captured ≤ `maxAmount`.
- **End-to-end on the fork:** one scenario per mode drives the HTTP app against the fork with the real contracts and the fake facilitator for Mode A.
- **Integration tests outside the suite:** INT-01 (real Mode A settlement on Base Sepolia with faucet USDC) and INT-02 (real Mode B `openTask` → delivery → capture → void, plus a `reclaim` path and a claim with Tuki off, on Base Sepolia). Defined in milestone 1, run progressively, mandatory in milestone 6.
- **Prior art:** `spikes/s0-x402-celo-sepolia/test/` (seller, failures, idempotency, agent, config, secrets, network tests; fake facilitator).
- Test scratch state lives outside the worktree; no secrets in fixtures; fixture receipts are synthetic or team receipts with redacted personal data.

## Out of Scope

- Real funds, mainnet, and any deployment of `TaskPolicy`/`RewardVault` outside testnet before a security review and audit.
- Refunds after capture.
- Proof of personhood integration (zkMe MeID / World ID / Human Passport — spike S7); the `IdentityVerificationProvider` interface exists but no provider is wired in P0.
- **S8 — Lighthouse/Filecoin/PDP**, conditioned on its five proofs: encrypted synthetic dataset uploaded with its CID; a real PDP proof tied to that dataset verified from Filecoin; an authorised Base Sepolia agent can decrypt and an unauthorised one cannot; content recovered with Tuki fully off; content matches its hash and the sold result's commitment. If PDP cannot be verified through Lighthouse, Synapse is tested before abandoning Filecoin. In P0, Mode B results are delivered through the API with `resultHash` and the signed receipt; tickets stay in R2. Even after S8, decryption access during the dispute window is the Q8 residual risk, not access gated on final capture.
- Staked or permissionless verifiers, economic dispute games, ZK proofs of correct aggregation, zkTLS, C2PA/device attestation, ARCA constatation (L2, spike S4).
- On-chain reputation, EAS attestations, ERC-8004 registration, Bazaar listing.
- Other networks (Solana, Celo, MiniPay), local-currency stablecoins, `upto`/`batch-settlement`, an x402 `auth-capture` transport.
- Revenue sharing with contributors, resale of commissioned data, differential privacy.
- An LLM-driven buyer agent (the demo client is rule-based).

## Further Notes

- Open blockers to resolve in the named experiment, never to assume: ERC-3009 token collector address and fee parameters of `AuthCaptureEscrow` on Base Sepolia (W1); gas per root and the real leaf limit (W1/W2); LLM provider retention terms and whether pre-LLM redaction is feasible (S3); legal retention periods (legal review).
- Candidate under consideration, not in P0: **Proof of Contribution** — a private `ContributionProof` (salted evidence leaf, Merkle proof to the anchored `evidenceRoot`, verifier signatures) kept by the contributor, separate from the reward proof; EAS attestations P1; reputation P2; ZK selective disclosure as research; no public NFT or token per receipt. It reuses W3 primitives; adopting it in P0 needs an explicit decision.
- Kill criteria in doc 17 are still pending team ratification; they gate buyer validation, not this build.
- `TaskPolicy` and `RewardVault` are new code that moves funds (high-risk). They get their own work-unit commits, an independent verification and a security review before any non-testnet use.
- The primary MVP success metric remains recurring buyers within 30 days, not receipt volume.
