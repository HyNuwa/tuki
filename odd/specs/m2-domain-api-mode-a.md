# M2a — Monorepo, domain, API and Mode A (plus frozen W3 formats)

> Parent: [`mvp-p0.md`](mvp-p0.md) — modules 1, 2, 3, 4 (quote only), 11 (thresholds used by catalog/coverage), 12 (formats only), 13 (Mode A entries), API contract, Data model, Milestones row 2, Testing Decisions (Seam 1). Implements Q2, Q3, Q4, Q5, Q10, Q13; PRD P0-01, P0-02, P0-03 (quote), P0-10; errors E5, E8, E9, E12. Prior art: `spikes/s0-x402-celo-sepolia/` (`seller.ts`, `settlement-guard.ts`, `facilitator.ts`, `network.ts`, `test/fake-facilitator.ts`, `test/idempotency.test.ts`).

## 1. Scope

Monorepo skeleton; `packages/domain` (pure types and rules); `apps/api` Hono app with the public routes, Mode A paid routes, the Q2 request-auth middleware, the Task quote, and PostgreSQL persistence for catalog, idempotency and ledger. Task opening, status and result routes exist only as far as Q2 auth requires a test target: they run against a `ChainGateway` fake that mirrors M1 §3 events. Freezes the W3 formats (§7) so M1 contracts and the data model agree. Out of scope: ingestion (M3), verifiers (M4), aggregation beyond the threshold rule (M5), MCP (M5).

## 2. Monorepo skeleton

- pnpm workspace with `apps/api`, `apps/contributor-web`, `apps/verifier`, `packages/contracts` (from M1, untouched), `packages/domain`, `packages/demo-client`. Only `apps/api` and `packages/domain` get code in M2a; the others get a `package.json` placeholder.
- TypeScript strict, vitest, pinned exact versions; `@x402/*` 2.31.0 and Hono as in the spike; Drizzle + PostgreSQL 16; Testcontainers for tests (Q10). No other technologies.

## 3. Ports (adapters faked in Seam 1)

| Port | Real adapter | Seam 1 fake |
|---|---|---|
| `PaymentRail` (x402 facilitator verify/settle) | `https://x402.org/facilitator` | spike `fake-facilitator.ts`, moved into `apps/api/test/` |
| `ChainGateway` (read escrow/TaskPolicy/RewardVault state and events, submit relayed tx) | viem on Base Sepolia | in-memory fake emitting M1 §3 events |
| `Clock` | system | controllable |
| `SignatureVerifier` (EOA, ERC-1271, ERC-6492) | viem `verifyTypedData` with a public client | real viem against a fake public client for 1271/6492 |

## 4. REST API

All responses carry header `x-tuki-demo: testnet-no-real-money` and the JSON field `demo: "TESTNET — NO REAL MONEY"` on bodies. Amounts are decimal strings of atomic USDC. Errors use `{ "error": { "code": string, "message": string, "retryable": boolean } }`.

| Route | Auth | Request | 200 response | Errors |
|---|---|---|---|---|
| `GET /v1/products` | none | `?cell=&ean=&cursor=` | `{ items: DataProductSummary[], nextCursor }` | — |
| `GET /v1/products/{id}` | none | — | `DataProduct` | `404 product_not_found` |
| `GET /v1/coverage` | none | `?productId=&cell=&ean=\|description=` | `{ sufficient: boolean, contributors, stores, observations, window, freshness, reason? }` counts only when `sufficient` (k/m rule) | `400 invalid_query` |
| `GET /.well-known/x402` | none | — | x402 discovery document listing paid routes with `scheme: "exact"`, `network: "eip155:84532"` | — |
| `GET /v1/prices` (and product data routes) | x402 `exact` | `?productId=&cell=&ean=` + `payment-identifier` | aggregate + `payment-response` header | `402` with requirements (amount `10000`, USDC asset, payTo); `409 insufficient_coverage` **before** any settle (E8, I8); `502 facilitator_unavailable retryable:true` (E12) |
| `POST /v1/tasks/quote` | none | `{ cell, products: [{ean}\|{description}], window: {from,to}, acceptance: {minLevel, origin}, deadline, partialAccepted }` | `Quote` (§4.1) | `422 quote_infeasible` with reason `reserve_insufficient` \| `quorum_unlikely` \| `deadline_invalid` |
| `POST /v1/tasks` | Q2 signature by the future payer | `{ quoteId }` | `{ taskId, paymentInfo, terms, termsHash, erc3009: {typedData} }` (agent signs, relayer submits `openTask`) | `401 auth_*`, `410 quote_expired` |
| `GET /v1/tasks/{id}` | Q2 signature by `payer` | — | `{ status, counts, timeline, chain: {paymentInfoHash, openedTx} }` | `401`, `403 not_task_owner`, `404` |

`DataProduct` fields (user stories 2–6): `id, title, coverage: {cells[], storeKinds[], storeCount, products: [{ean?, description?}]}, freshness, observationWindow, origin: "receipt"\|"shelf_photo", minVerificationLevel: "L0".."L3", observationCount, contributorCount, licence, priceAtomic`. Products with `synthetic` data or below k = 5 / m = 3 are never listed (US 8).

### 4.1 Quote

`{ quoteId, expiresAt, pricePerObservation: "1000000", feeBps: 3000, rewardPerObservation: "500000", maxRewardedObservations, maxPerContributor: 3, minQuorum, suggestedBudget, partialAccepted, timeline: {deadline, maxDeliveryDelay: 86400, disputeWindow: 172800, resolutionWindow: 86400, operationalMargin: 86400, authorizationExpiry, refundExpiry}, warnings[] }`. `authorizationExpiry` follows M1 §3.2. Refuses with `reserve_insufficient` when vault free reserve (from `ChainGateway`) < `maxRewardedObservations × reward` (US 22, I17). `preApprovalExpiry` is [Pending] (M1 §2).

### 4.2 Q2 request signature

EIP-712 domain `{name: "Tuki Protocol", version: "1", chainId: 84532, verifyingContract: <TaskPolicy address>}`; type `AgentRequest(bytes32 taskId,string method,string path,bytes32 queryHash,bytes32 bodyHash,bytes32 nonce,uint48 deadline)`. Headers: `x-tuki-signer`, `x-tuki-signature`, `x-tuki-nonce`, `x-tuki-deadline`. For `POST /v1/tasks` `taskId = 0x0` and the signer becomes the payer. Rules: `deadline − now ≤ 300 s` and `> now`; nonce inserted into `agent_request_nonces` in the same DB transaction as the effect; signer must equal the Task's escrow `payer`. `Idempotency-Key` header on mutating routes returns the stored response for a repeat.

## 5. Data model (PostgreSQL 16, Drizzle)

| Table | Key columns | Unique constraints |
|---|---|---|
| `data_products` | id, coverage jsonb, licence, price_atomic, synthetic bool | id |
| `tasks` | task_id bytea32, quote_id, payer, terms_hash, timeline columns, max_rewarded_observations, max_per_contributor, min_quorum, partial_accepted, status | task_id; quote_id |
| `quotes` | quote_id, payload jsonb, expires_at | quote_id |
| `x402_payments` | payer, payment_identifier, eip3009_nonce, state (`verified`\|`settling`\|`settled`\|`unknown`\|`failed`), response_hash | (payer, payment_identifier); eip3009_nonce |
| `agent_request_nonces` | signer, nonce, used_at | (signer, nonce) |
| `idempotency_keys` | signer, key, route, response | (signer, key, route) |
| `ledger_entries` | id, tx_group, account, debit_atomic, credit_atomic, ref | — (check: each tx_group balances) |
| `mode_a_credits` | payer, payment_identifier, amount_atomic | (payer, payment_identifier) |

Later milestones add `contributions`, `observations`, `media_refs`, `reward_entries`, `epochs`, `verifier_decisions` with the parent's uniques (fiscal key, `sha256`, decision nonce, leaf `(epoch_id, index)`).

## 6. Acceptance criteria (Seam 1: in-process Hono + real PostgreSQL 16 via Testcontainers)

| ID | Behaviour |
|---|---|
| M2A-AC1 | Catalog and product detail list only non-synthetic products meeting k/m; free, no headers needed (US 1–10, P0-01). |
| M2A-AC2 | Coverage for a cell below k/m returns `sufficient: false` and no counts that undercut the threshold. |
| M2A-AC3 | Paid route without payment → `402` with exact requirements; with a valid fake payment → 200 aggregate + decoded `payment-response` (P0-02). |
| M2A-AC4 | Insufficient coverage at purchase → `409` and the fake facilitator records zero settle calls (E8, I8). |
| M2A-AC5 | Same `payment-identifier` retried → same body, one settle total (I11); 20 concurrent identical requests → exactly one settle (unique constraint, in-flight serialisation). |
| M2A-AC6 | Replayed EIP-3009 authorization with a new `payment-identifier` → rejected or served from cache, never a second settle. |
| M2A-AC7 | Settle succeeded but delivery fails → `mode_a_credits` row and balanced ledger group (E5, I12). |
| M2A-AC8 | Settle outcome unknown → state `unknown`, reconciled by the authorization-used event on the `ChainGateway` fake before any retry (I5). |
| M2A-AC9 | Facilitator down → `502 retryable` and no ledger entry (E12). |
| M2A-AC10 | Wrong network, wrong amount, expired authorization → `402` with a reason from the facilitator (US 17). |
| M2A-AC11 | Quote returns every field of §4.1; refuses with `reserve_insufficient` when the fake vault free reserve is short. |
| M2A-AC12 | Q2: expired deadline, deadline > 5 min ahead, replayed nonce, wrong owner, tampered body/query hash → 401/403; EOA, ERC-1271 and ERC-6492 valid signatures → 200; nonce consumption is atomic under concurrency. |
| M2A-AC13 | No response body of any agent route contains images, individual observations or contributor identifiers (I6, P0-10) — schema-level test over every route. |
| M2A-AC14 | Every response is marked testnet (header and body). |

## 7. Frozen W3 formats (consumed by M1 contracts, M4 and M5) [Design]

RFC 8785 (JSON canonicalization) is a serialization rule, implemented inline in `packages/domain`; it adds no dependency.

- **Evidence leaf:** `evidenceLeaf = keccak256(abi.encodePacked(salt, evidenceDigest, observationId, level, extractionHash))` with `salt` 32 random bytes, `evidenceDigest` = `sha256` of the EXIF-free encrypted original's plaintext, `observationId` bytes16 UUID, `level` uint8 (0–3), `extractionHash` = `keccak256` of the canonical extraction JSON (RFC 8785). [Design, from parent module 12]
- **`evidenceRoot`:** M1 §3.6 tree over the evidence leaves of the deliverable observations in a result, ordered by `observationId`.
- **`resultHash`:** `keccak256` of the RFC 8785 canonical result JSON delivered to the agent.
- **Signed receipt:** `{ taskId, resultHash, evidenceRoot, leafCount, level, deliveredAt, prevReceiptHash, receiptHash }` appended to a hash-chained log (`receiptHash = keccak256(canonical(receipt without receiptHash))`); anchored by the `DeliveryRegistered` event of M1 §3.4.
- **Contribution leaf (PoC):** as parent module 12; type hash `ContributionLeaf(uint256 chainId,address vault,uint64 epochId,bytes32 contributionCommitment)`.

Any change after M2a exit requires editing M1 §3 and this section together.

## 8. Entry, exit, blocked (copied from the parent)

- **Entry:** Monorepo skeleton; PostgreSQL 16 via Testcontainers.
- **Exit (verifiable):** Catalog, coverage, quote and Mode A purchase pass Seam 1 tests; idempotency guard on PostgreSQL; S3 report on team receipts with extraction accuracy, redaction false negatives and fiscal-data loss; evidence leaf, receipt and delivery event formats documented. (The S3 report is [`m2-s3-extraction-spike.md`](m2-s3-extraction-spike.md).)
- **Blocked when:** S3 shows extraction or redaction not reliable even with manual review at reasonable cost.

## 9. Edit surfaces

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json
.npmrc
apps/api/**
apps/contributor-web/package.json
apps/verifier/package.json
packages/domain/**
packages/demo-client/package.json
odd/specs/m2-domain-api-mode-a.md
```

## 10. Dependencies

Independent of M1 (uses the `ChainGateway` fake shaped by M1 §3). Parallel with M1 and M2b. M3, M4, M5 build on it.
