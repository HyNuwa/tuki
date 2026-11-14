# Spec: MVP P0 — verified real-world commerce data marketplace for AI agents (Base Sepolia, minimized trust)

> Source of truth for this spec: docs 03, 04, 15, 16, ADR 0002 (verification), ADR 0003 (Base) and ADR 0004 (trust model, ratified 2026-11-14 for testnet). Domain terms follow those docs: **DataProduct** (data product), **Task** (encargo), **Contribution** (contributed data), **Observation**, **Contributor**, **Agent** (buyer), **Verifier**. Testnet only: every screen and response is marked "DEMO — TESTNET, NO REAL MONEY".

## Problem Statement

AI agents (and the companies that run them) need real-world commerce facts that are not online: what a product actually costs at small physical stores in a region (first vertical: price paid and availability in traditional retail in the Argentine NOA). Today they can only get list prices from free public sources (SEPA) or expensive, slow retail panels that do not cover the traditional channel. An agent cannot programmatically discover whether such data exists, buy it on demand, or commission new observations when it does not exist yet.

When an agent does commission new data, it has no reason to trust the operator: it has to hand over its budget to a custodial account, believe that observations were really checked, and hope the unused budget comes back. On the other side, the people who contribute receipts have no enforceable guarantee they will be paid for accepted work, and their receipts contain personal data that must never reach the buyer.

## Solution

A marketplace with two modes, operated by the platform but with its critical powers limited by contracts on Base Sepolia and by independent verifiers:

- **Mode A — buy existing data.** The agent browses a free catalog of DataProducts (coverage, freshness, origin, minimum verification level, counts, licence, price), checks coverage for free, and buys an aggregate per request with x402 `exact` in USDC. It pays only when the platform can deliver.
- **Mode B — commission new observations.** The agent quotes a Task (zone, products, window, acceptance criteria, budget, deadline), authorises its budget into the already-deployed `AuthCaptureEscrow`, and gets a deliverable aggregate when enough independent, verified observations arrive. The platform **cannot capture the budget on its own**: the escrow's operator is a policy contract that only captures with an M-of-N signed decision from independent verifiers and no open dispute. If the platform disappears, the agent recovers the unused budget with `reclaim` after expiry.
- **Contributors** accept versioned consent terms, upload a receipt photo to an open Task, and follow its status. Accepted observations earn a reward that is guaranteed by a pre-funded reward vault and claimable with a proof even without the platform's API.
- **Privacy by construction.** Buyers receive only aggregates above the privacy thresholds (k distinct contributors, m distinct stores) with quality metadata, a provenance receipt and verifier signatures, never images, individual observations or contributor identifiers.

## User Stories

### Agent — discovery (Mode A and B)

1. As an agent, I want to list DataProducts for free, so that I can learn what data exists before spending anything.
2. As an agent, I want each DataProduct to declare coverage (zones, store kinds, store count, categories), so that I can decide if it answers my question.
3. As an agent, I want each DataProduct to declare freshness and observation window, so that I do not buy stale data.
4. As an agent, I want each DataProduct to declare its origin (receipt or shelf photo) and minimum verification level (L0–L3), so that I know how much to trust it.
5. As an agent, I want each DataProduct to declare observation and contributor counts, so that I can judge statistical weight.
6. As an agent, I want each DataProduct to declare its licence and price in atomic USDC units, so that I know what I can do with it and what it costs.
7. As an agent, I want a free coverage check for a specific product and zone, so that I avoid paying for a cell without enough data.
8. As an agent, I want products below the privacy thresholds to never be listed, so that published counts never undercut privacy.
9. As an agent, I want to discover the service through `/.well-known/x402`, the REST catalog or the MCP `list_products` tool, so that I can integrate in whatever way my framework supports.
10. As an agent, I want discovery to work without any payment setup, so that browsing is independent of the payment rail.

### Agent — Mode A purchase

11. As an agent, I want a paid data request to answer `402 Payment Required` with exact x402 requirements (scheme, Base Sepolia network, USDC asset, amount, pay-to), so that my x402 client can pay automatically.
12. As an agent, I want to receive the aggregate and a decoded payment response after paying, so that I have the data and proof of payment.
13. As an agent, I want the platform to refuse before charging when it already knows it cannot deliver (no coverage, below thresholds), so that I never pay for nothing.
14. As an agent, I want a retry with the same payment identifier to return the already-paid result without charging again, so that network failures never double-charge me.
15. As an agent, I want a replay of the same signed authorization to be rejected or answered from cache, so that a leaked header cannot be used to charge me twice.
16. As an agent, I want a credit or refund recorded when a settled payment cannot be delivered, so that the platform owes me what I paid.
17. As an agent, I want expired, wrong-amount or wrong-network payments to be rejected with a clear reason, so that I can fix my client.
18. As an agent, I want a facilitator outage to fail the request without a partial charge and with a retryable error, so that I can try later.
19. As an agent, I want repeated or overlapping queries that could isolate an individual observation to be limited or suppressed, so that the marketplace is not usable for re-identification.

### Agent — Mode B task lifecycle

20. As an agent, I want to quote a Task for free with zone, products, observation window, acceptance criteria and deadline, so that I see feasibility, price per deliverable observation, suggested budget and partial-result policy before committing.
21. As an agent, I want the quote to state `deadline`, `refundDeadline = deadline + 72 h`, the capture and refund expiries and the partial policy, so that the rules are fixed before I fund.
22. As an agent, I want the quote to warn or refuse when the Task is unlikely to reach its minimum quorum, so that I do not lock funds in a Task that will fail.
23. As an agent, I want to fund a Task by signing an authorization into `AuthCaptureEscrow` with a maximum equal to my budget, so that my funds sit in a contract and not in a platform account.
24. As an agent, I want the escrow operator to be a published policy contract, so that I can verify which rules gate the capture of my funds.
25. As an agent, I want the Task to open only after the escrow authorization is confirmed on chain, so that no work starts without real funding.
26. As an agent, I want to read the Task status for free (open, filling, deliverable, closed, expired, cancelled), so that I can follow progress.
27. As an agent, I want the Task to stop accepting observations when its budget quota is full, so that my budget can never be exceeded.
28. As an agent, I want to be charged only for deliverable results, so that accepted-but-undeliverable observations are not my cost.
29. As an agent, I want the capture amount to be at most what the verifiers' signed decision states and never above my authorised maximum, so that the platform cannot overcharge.
30. As an agent, I want the unused budget returned with `void` when the Task closes, so that I get my money back without asking.
31. As an agent, I want to `reclaim` my authorised funds myself after the authorization expiry if the platform stops responding, so that I never depend on the operator to recover them.
32. As an agent, I want a Task that expires below the minimum quorum to return 100% of the undelivered budget unless I accepted partial results in the quote, so that incomplete work is not charged.
33. As an agent, I want to cancel a Task and get the unused budget back under the rules published in the quote, so that I can change my mind.
34. As an agent, I want to download the Task result (aggregate, quality metadata, provenance receipt, verifier signatures) at no extra cost, so that delivery is part of what I paid.
35. As an agent, I want the result to declare verification level, observation and contributor counts, period, suppressions, `groundTruthScore` and price conflicts, so that I can judge quality.
36. As an agent, I want to open a dispute on a delivered result before `refundDeadline`, so that wrong data can be refunded.
37. As an agent, I want a capture to be blocked while a dispute on that batch is open, so that disputed results are not settled behind my back.
38. As an agent, I want a dispute resolved against the platform to trigger a `refund` only with a signed verifier decision, so that refunds follow the same rules as captures.
39. As an agent, I want the default licence of commissioned data to be `task_only`, so that what I commissioned is not resold to others.

### Contributor

40. As a contributor, I want to read and accept versioned consent terms (purpose, licence scope, what cannot be recalled), so that I know how my data is used before uploading.
41. As a contributor, I want to see open Tasks near me and what each one pays per accepted observation, so that I can choose where to contribute.
42. As a contributor, I want to upload a receipt photo to a Task, so that I can earn a reward.
43. As a contributor, I want to see my contribution status (verifying, accepted, rejected with reason, in review), so that I know what happened.
44. As a contributor, I want a clear rejection reason (duplicate, illegible, total mismatch, out of Task criteria, quota full), so that I can retry correctly.
45. As a contributor, I want to retry after an extraction failure, so that a bad photo does not cost me the reward.
46. As a contributor, I want every accepted, non-revoked observation to be paid even if the Task ends without a deliverable result or the agent cancels, so that my work is never lost.
47. As a contributor, I want my reward to be a claimable entry in a pre-funded reward vault with a published proof, so that I can collect it even if the platform API is down.
48. As a contributor, I want rewards to be paid in periodic batches rather than one transfer per receipt, so that my on-chain history reveals less about my shopping habits.
49. As a contributor, I want to see my pending and confirmed rewards, so that I can track earnings.
50. As a contributor, I want a per-person cap per Task, so that one contributor cannot dominate a Task (and I understand why I was capped).
51. As a contributor, I want to withdraw consent at any time, so that my observations leave future aggregates and sales.
52. As a contributor, I want to be told that results already delivered cannot be recalled and that paid rewards are not reversed, so that withdrawal has no surprises.
53. As a contributor, I want my buyer name, document number and card digits masked before any reviewer sees the image, so that my personal data is protected.
54. As a contributor, I want sensitive image metadata (exact location, device data) stripped before storage, so that the platform keeps only what it needs.

### Verifier

55. As a verifier, I want to receive a batch of accepted observations with their evidence summaries (checks, levels, extraction confidence) but no contributor identity, so that I can judge validity without seeing personal data.
56. As a verifier, I want to sign a typed decision over a batch (task, evidence root, accepted set, deliverable flag, capture amount, reward root), so that my approval is attributable and machine-checkable.
57. As a verifier, I want my signature to be valid only for that task, batch and nonce, so that it cannot be replayed on another Task.
58. As a verifier, I want to be one of N independent keys and the policy to require M signatures, so that no single party (including the platform) decides alone.
59. As a verifier, I want to resolve disputes with a signed decision, so that refunds and captures follow the same accountability.
60. As a verifier, I want to request a sample of original evidence through logged, time-limited access, so that I can audit without broad exposure.

### Platform operator

61. As the operator, I want the pipeline to decode the ARCA fiscal QR before any OCR, so that issuer, date, total and authorization code are read exactly and for free.
62. As the operator, I want duplicates rejected by fiscal key `(cuit, ptoVta, tipoCmp, nroCmp)` and exact `sha256`, and near-duplicates (`pHash` within threshold) sent to review, so that the same receipt is never paid twice.
63. As the operator, I want extraction by a vision LLM with schema-validated JSON and deterministic checks (sum of items = total = QR amount), so that invented prices are rejected or reviewed, never accepted by default.
64. As the operator, I want ambiguous cases routed to a manual review queue with masked evidence, so that humans handle exceptions.
65. As the operator, I want aggregates published only with ≥ k distinct contributors and ≥ m distinct stores (demo: k = 5, m = 3), with single-store suppression and time/location rounding, so that no individual can be re-identified.
66. As the operator, I want each accepted observation committed as a salted leaf and each aggregate as a Merkle `evidenceRoot` in a signed receipt in an append-only log, anchored on Base, so that buyers and auditors can check integrity without seeing tickets.
67. As the operator, I want a double-entry ledger that projects on-chain escrow and vault state plus off-chain obligations and balances per Task, so that budget = captured + refunded + held at all times.
68. As the operator, I want the task engine to pause opening new Tasks when the reward reserve cannot cover accrued rewards of open Tasks, so that contributor guarantees stay solvent.
69. As the operator, I want payouts whose on-chain result is unknown to be reconciled against the chain before any retry, so that rewards are never paid twice.
70. As the operator, I want fraud detected after acceptance to revoke an unpaid observation and remove it from aggregates, so that losses are contained (paid rewards are not clawed back).
71. As the operator, I want no secrets in clients and no personal data or images on chain or in logs, so that the demo meets its privacy and security floor.
72. As the operator, I want every state change, payment and payout to be idempotent and recoverable after a restart, so that crashes do not corrupt money flows.
73. As the operator, I want a simple automated demo client (no LLM) that discovers, decides with fixed rules, pays and consumes results for both modes, so that the demo runs end to end without manual steps except review.
74. As the operator, I want p50/p95 metrics for extraction time and time-to-result, plus the manual review rate, so that we measure operational cost without promising unmeasured thresholds.

## Implementation Decisions

### Architecture and trust (ADR 0003, ADR 0004)

- Network: Base Sepolia (`eip155:84532`), USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (name `USDC`, version `2`, 6 decimals). One active network behind `PaymentRail`; storage is independent of the payment chain.
- Source of truth for funds is on-chain state (escrow, policy, reward vault). PostgreSQL is the operational projection: coordination, deduplication, indexing and the ledger; it never authorises a fund movement by itself.
- Powers matrix from ADR 0004 is normative: the platform alone may publish the catalog, sell Mode A data, reject or review observations and `void` (which only favours the agent); capture, dispute refunds and reward roots require M-of-N verifier signatures; the agent can always `reclaim` after `authorizationExpiry`; contributors can claim attested rewards from the vault without the API.

### Modules

1. **Catalog & discovery** — DataProduct contract, coverage check, `/.well-known/x402`, MCP `list_products`. Knows prices as data; has no dependency on the payment rail. Never lists products below k/m.
2. **Mode A payments** — x402 `exact` through the Base Sepolia facilitator (`https://x402.org/facilitator`, no API key) using the `@x402/*` v2 SDK and Hono middleware, as in spike S0. Idempotency guard (EIP-3009 nonce key and payer + `payment-identifier` key, in-flight serialisation, refuse-after-uncertain-settle) moves from memory to PostgreSQL with unique constraints. The paid handler has no irreversible effects before settlement (the Hono middleware runs the handler before settle). Uncertain settles are reconciled on chain by the authorization-used event before deciding, following the official Celo example's approach.
3. **Task engine** — quote, open, per-store/day quotas, per-contributor cap, acceptance criteria, minimum and target quorum, deadline, `refundDeadline = deadline + 72 h` (fixed at quote, not changeable unilaterally), close, expiry, cancellation, `paused` when the reserve is short.
4. **Escrow adapter (Mode B funding)** — uses the deployed `AuthCaptureEscrow` v1.1 (`0xf96815976523E00e65Be8f34cA5e64b4f41EB19c` on Base Sepolia) and its token collector. `PaymentInfo`: payer = agent, operator = **TaskPolicy contract**, receiver = **RewardVault**, `maxAmount` = budget, `authorizationExpiry` > deadline + review time, `refundExpiry` = `refundDeadline`, fee bounds fixed at quote. The agent signs off-chain; the platform relays the `authorize` call through TaskPolicy and pays gas. The testnet x402 facilitator does not list `auth-capture`, so Mode B funding does not go through the x402 facilitator in P0 (an x402 `auth-capture` transport is a later option).
5. **TaskPolicy contract (new, Solidity)** — the escrow `operator`. Functions: relay `authorize`; `capture` only with an EIP-712 decision signed by M of N registered verifiers over `{taskId, paymentInfoHash, batchId, evidenceRoot, rewardRoot, captureAmount, deliverable, nonce, expiry}` and no open dispute for that batch; `void` callable by the platform (favours agent); dispute open by the payer before `refundDeadline`; `refund` only with a signed dispute decision. Rejects reused nonces, expired decisions, amounts above the signed amount and decisions for another Task. Verifier set and M are fixed per deployment for the demo (no upgradeability, no admin capture path).
6. **RewardVault contract (new, Solidity)** — receives captured funds and a platform-funded reserve. Accepts a verifier-signed `rewardRoot` per batch (Merkle tree of `(claimant, amount, batchId)`); contributors (or a batching relayer acting for them) claim with a Merkle proof; each leaf claimable once. Accrued rewards for accepted-but-undeliverable observations are covered from the reserve. Exposes reserve balance and accrued liabilities so the task engine can pause.
7. **Contributor API and web app (PWA)** — versioned consent per purpose and licence scope, open Tasks, upload, status, rewards, consent withdrawal. Contributor identity (wallet) lives in a table separated from observations. No identity-provider integration in P0 (see Out of Scope).
8. **Ingestion pipeline** — screening, fiscal QR decode (ARCA JSON in Base64; drop `tipoDocRec`/`nroDocRec`), `sha256` + `pHash` dedupe, `Extractor` (vision LLM, schema JSON, confidence, model version), deterministic checks, `Verifier` layers L0–L3 (L2 ARCA constatation stays a spike; P0 reaches L1 + L3), review queue, masking before review, EXIF stripping (decision on keeping a boolean "has camera EXIF" fraud signal is open — see Further Notes).
9. **Verifier service** — separate process(es) holding their own keys; reads batches through an evidence-summary API without contributor identity; signs decisions and dispute resolutions. In the demo, N = 2 independent keys held by different team members, M = 2 [assumption: M and N to be confirmed].
10. **Aggregation & privacy** — k = 5, m = 3 (experimental), single-store suppression, day/week and locality/cell rounding, query budget and overlap checks per buyer.
11. **Provenance** — salted leaf `H(salt ‖ evidenceDigest ‖ observationId ‖ level ‖ extractionHash)`, Merkle `evidenceRoot` per aggregate, signed receipt in an append-only hash-chained log, root anchored on Base (via TaskPolicy decision events or a minimal anchor call). Buyers receive receipt + signatures; authorised auditors verify samples.
12. **Ledger** — double-entry entries for budgets held, captures (`task.charged`), rewards owed (`contributor.owed`), reserve, fees, credits and refunds; projection reconciled from chain events; amounts as integers in atomic units, never floats.
13. **Object storage** — private S3-compatible bucket, encrypted, short signed URLs, lifecycle deletion; provider (Cloudflare R2 or Supabase Storage) behind an adapter [open].
14. **MCP server** — thin layer over the same services: `list_products`, coverage, paid purchase tool, quote/create/status/result for Tasks; structured commerce-observation schemas only (no free-text physical tasks).
15. **Demo client** — rule-based agent (no LLM) for Mode A and Mode B, using `@x402/fetch` with spend controls and an escrow-signing helper.

### API contract (REST, from doc 04)

- Free: `GET /v1/products`, `GET /v1/products/{id}`, `GET /v1/coverage`, `POST /v1/tasks/quote`, `GET /v1/tasks/{id}`.
- Paid (x402 `exact`): `GET /v1/prices` (and product data routes).
- Mode B: `POST /v1/tasks` returns the escrow `PaymentInfo` to sign; the Task opens after the on-chain authorization is confirmed. `GET /v1/tasks/{id}/result` is included in the budget. `POST /v1/tasks/{id}/cancel`, dispute endpoint mirroring the on-chain dispute.
- Contributor: consent, tasks nearby, contributions upload/status, rewards, consent withdrawal.

### Data model (from doc 04)

- `DataProduct`, `Task` (with `deadline`, `refundDeadline`, `receiptTotal`, `rebate`, acceptance, quorum, `maxPerContributor`, `minDistinctContributors`), `Contribution`, `Observation` (states `accepted → aggregation_eligible → deliverable`, plus `rejected`, `in_review`, `revoked`, `withdrawn`), `Payout`, ledger entries. New: `PaymentInfo` hash per Task, verifier decisions (batch, signatures, nonce), `evidenceRoot`, `rewardRoot`, `MediaRef` with `evidenceDigest` and key id.
- Uniques: fiscal key, `sha256`, `payment-identifier` per payer, auth nonce, decision nonce, reward leaf.

## Testing Decisions

- **Good tests check external behaviour only:** HTTP responses (status, body, headers including `payment-required` / `payment-response`), persisted state visible through the API, emitted chain state and events, and balances. No assertions on private functions or internal call order. Each rule's test asserts every observable effect (output, status, persisted data, balances).
- **Seam 1 — HTTP application in process.** The Hono app is called with in-process requests. Fakes only at external adapters: x402 facilitator (prior art: the spike's fake facilitator), `Extractor` (fixed JSON per fixture receipt), object storage (in memory), clock (deadlines, `refundDeadline`), and a chain gateway fake for unit-level API tests. PostgreSQL is real (unique constraints back dedupe, idempotency and ledger invariants). Covers P0-01..P0-10 and error scenarios E1–E12 from doc 03.
- **Seam 2 — contracts.** TaskPolicy and RewardVault tested against a local fork of Base Sepolia that includes the deployed `AuthCaptureEscrow` and USDC: full lifecycle (authorize → capture with M-of-N → void), `reclaim` after expiry with the platform offline, capture without signatures reverts, replayed/expired/foreign-task decisions revert, capture above the signed amount reverts, dispute blocks capture, refund only with a signed dispute decision, reward claims with proofs, double claim reverts, reserve accounting. These are the ADR 0004 experiments W1 and W2 as tests.
- **End-to-end on the fork:** one scenario per mode drives the HTTP app against the fork (with the real contracts) and the fake facilitator for Mode A.
- **Integration tests outside the suite, before deploy:** INT-01 (real Mode A settlement on Base Sepolia with faucet USDC) and INT-02 (real Mode B authorize/capture/void and reclaim on Base Sepolia).
- **Prior art:** `spikes/s0-x402-celo-sepolia/test/` (seller, failures, idempotency, agent, config, secrets, network tests; fake facilitator).
- Test scratch state lives outside the worktree; no secrets in fixtures; fixture receipts are synthetic or team receipts with masked personal data.

## Out of Scope

- Real funds, mainnet, and any deployment of TaskPolicy/RewardVault outside testnet before a security review and audit.
- Proof of personhood integration (zkMe MeID / World ID / Human Passport — spike S7); the `IdentityVerificationProvider` interface exists but no provider is wired in P0.
- Filecoin / IPFS / Lighthouse storage (spike S8); tickets stay in private storage.
- Staked or permissionless verifiers, economic dispute games (UMA-style), ZK proofs of correct aggregation, zkTLS, C2PA/device attestation, ARCA constatation (L2, spike S4).
- On-chain reputation, ERC-8004 registration, Bazaar listing (allowed later; not required for P0).
- Other networks (Solana, Celo, MiniPay), local-currency stablecoins, `upto`/`batch-settlement`.
- Revenue sharing with contributors, resale of commissioned data, differential privacy.
- An LLM-driven buyer agent (the demo client is rule-based).

## Further Notes

- Open decisions to settle during implementation: verifier M and N and who holds the keys; storage provider (R2 vs Supabase); EXIF handling (strip vs keep a boolean "camera EXIF present" signal for fraud detection); reserve percentage and minimum balance; payout batching period; whether the anchor is a dedicated call or emitted by TaskPolicy decisions.
- Kill criteria in doc 17 are still pending team ratification; they gate buyer validation, not this build.
- TaskPolicy and RewardVault are new code that moves funds (high-risk). They get their own work-unit commits, an independent verification and a security review before any non-testnet use.
- The primary MVP success metric remains recurring buyers within 30 days, not receipt volume.
- The project is not "Halo": Halo is an analysed competitor (`agent-data-marketplace/lecciones-halo-x402.md`).
