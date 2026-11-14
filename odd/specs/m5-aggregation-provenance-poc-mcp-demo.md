# M5 — Aggregation, provenance (W3) with Proof of Contribution, MCP and demo client

> Parent: [`mvp-p0.md`](mvp-p0.md) — modules 4 (delivery, capture, close), 11, 12 (incl. PoC), 15, 16, Milestones row 5, Testing Decisions (W3/PoC, end-to-end on the fork). Implements Q3, Q8, Q13.3; PRD P0-08, P0-09; errors E2, E7, E9; invariants I2, I6, I7, I13, I15. Formats: [`m2-domain-api-mode-a.md`](m2-domain-api-mode-a.md) §7.

## 1. Scope

Aggregation with privacy rules; Task delivery (`resultHash`, `evidenceRoot`, signed receipt, `registerDelivery`), dispute mirroring, capture, void and close; the PoC contribution tree, proof delivery and a standalone proof verifier; MCP server; rule-based demo client.

## 2. Aggregation rules

k = 5 distinct contributors, m = 3 distinct stores (demo parameters), single-store suppression, day/week and cell rounding, per-buyer query budget and global overlap checks (E9); only `aggregation_eligible`, non-`synthetic` observations (I13); a failing aggregate is `suppressed`, exposes no prices and is not charged (I7).

## 3. Task delivery and settlement

1. When the Task is deliverable (or at `deadline` with partial policy), build the result, `resultHash`, `evidenceRoot` and receipt (M2a §7); both verifiers sign `DeliveryRecord`; relayer calls `registerDelivery`.
2. `GET /v1/tasks/{id}/result` (Q2 auth) returns `{ aggregate, quality: {level, observationCount, contributorCount, period, suppressions, groundTruthScore, priceConflicts}, resultHash, receipt, verifierSignatures, licence: "task_only" }` at no extra cost.
3. Disputes are read from `DisputeOpened`/`DisputeResolved` events and mirrored in the Task status; the API offers no route to open one.
4. After `disputeDeadline`, verifiers sign `CaptureDecision` and the relayer calls `capture`; below quorum without `partialAccepted`, the platform calls `voidTask` (E2, I2). `POST /v1/tasks/{id}/cancel` voids under the quote's published rules (E7).

## 4. Proof of Contribution

As parent module 12, verbatim rules. Concretely: the epoch build adds the contribution tree (leaf type in M2a §7, independent shuffle, `bindingSalt` random per leaf and never stored by Tuki), fills `contributionRoot` in `EpochRoot`, and `publishRoot` emits the ordered contribution leaf hashes. `GET /v1/contributions/{id}/proof` returns nothing until the epoch root is confirmed. `packages/domain` exports `verifyContributionProof(proof, chainEvents, verifierSet)` usable with no Tuki API, DB or key.

## 5. MCP and demo client

- MCP tools over the same services: `list_products`, `check_coverage`, `buy_prices` (x402), `quote_task`, `create_task`, `task_status`, `task_result`. Structured commerce-observation schemas only.
- Demo client (`packages/demo-client`, no LLM): `@x402/fetch` with spend limits, ERC-3009 escrow signer, Q2 request signer; scripted scenarios: Mode A buy, Mode A retry, Mode B happy path, dispute, quorum miss, `reclaim`.

## 6. Acceptance criteria

| ID | Seam | Behaviour |
|---|---|---|
| M5-AC1 | Seam 1 | k/m, single-store suppression, rounding and overlap checks suppress the cases of E9; synthetic fixtures never appear in a sold or delivered result. |
| M5-AC2 | e2e fork | Mode B: deliverable Task → `registerDelivery` event carries `resultHash` and `evidenceRoot` equal to the API result; capture after window; remainder voided. |
| M5-AC3 | e2e fork | Below quorum, no partial → agent charged 0, 100 % voided (E2, I2). |
| M5-AC4 | e2e fork | Agent opens a dispute on chain; API status shows `disputed`; capture reverts until resolution (I15). |
| M5-AC5 | Seam 1 | Result body contains no images, individual observations or contributor ids (I6). |
| M5-PoC-a | fork | A valid proof verifies with Tuki fully off. |
| M5-PoC-b | fork | Altering any evidence-leaf field, the salt, the binding or the proof makes verification fail. |
| M5-PoC-c | fork | An observation accepted in a Task without a deliverable result has a valid proof. |
| M5-PoC-d | Seam 1 | No proof is issued before its epoch root is on chain. |
| M5-PoC-e | fork | Contribution and reward leaves of one epoch share no hash, salt or index ordering; public data alone cannot link them to a wallet. |
| M5-AC6 | Seam 1 | Each MCP tool returns the same data as its REST route. |
| M5-AC7 | e2e fork | Demo client runs every scripted scenario end to end without manual steps except review. |

## 7. Entry, exit, blocked (copied from the parent)

- **Entry:** Milestones 2–4.
- **Exit (verifiable):** k/m and overlap checks; signed receipt and `evidenceRoot` anchored via `registerDelivery`; PoC acceptance (a)–(e) in module 12 passes; MCP tools; demo client runs both modes and failure scenarios.
- **Blocked when:** —

## 8. Edit surfaces

```text
apps/api/src/aggregation/**
apps/api/src/delivery/**
apps/api/src/provenance/**
apps/api/src/mcp/**
apps/api/src/epochs/**
apps/api/src/db/schema/**
apps/api/drizzle/**
apps/api/test/**
apps/verifier/**
apps/contributor-web/src/rewards/**
packages/domain/**
packages/demo-client/**
odd/specs/m5-aggregation-provenance-poc-mcp-demo.md
```

## 9. Dependencies

M2a, M3, M4. Aggregation (§2) and MCP/demo-client Mode A parts can start after M2a, in parallel with M3/M4.
