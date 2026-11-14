# M3 — Ingestion pipeline, extractor and contributor flow

> Parent: [`mvp-p0.md`](mvp-p0.md) — modules 4 (acceptance, quotas, caps), 8 (contributor API/PWA), 9, 14, Milestones row 3. Implements Q1, Q3, Q11, Q13.1, Q13.5; PRD P0-05, P0-06, P0-10; errors E1, E3, E4, E6, E11; invariants I3, I6, I9, I13.

## 1. Scope

Contributor SIWE auth, consent, nearby Tasks, upload, status, appeals, consent withdrawal (API + PWA screens), and the ingestion pipeline up to accept/reject/review. Reward states stay `verified_pending_commitment` (commitment is M4).

## 2. Pipeline (ordered; each step's outcome persisted)

1. Screening: MIME/size limits; Task open and not at `maxRewardedObservations` (else `quota_full`, E1); contributor below cap 3 for this Task (else `contributor_cap_reached`).
2. EXIF in memory → `hasCameraExif`, `softwareTagPresent`, `captureTimeConsistent`; strip all metadata; GPS never stored; missing EXIF never rejects (Q11).
3. Fiscal QR decode (ARCA JSON in Base64) before any LLM call; drop `tipoDocRec`/`nroDocRec`.
4. Dedupe: fiscal key `(cuit, ptoVta, tipoCmp, nroCmp)` and `sha256` unique → reject `duplicate`; `pHash` within threshold [Pending: S3] → review (E3, I3).
5. Sensitive-data preprocessing before the external call where S3 found it feasible.
6. `Extractor` (provider from S3) → schema-validated JSON (M2b §4).
7. Deterministic checks: sum of items = total = QR amount; mismatch → reject `total_mismatch` or review (E4).
8. Selective redaction → review copy; uncertain redaction → internal review only, never external (Q11, US 69).
9. Level assignment (L1 + L3 in P0) and outcome: `accepted` / `rejected(reason)` / `in_review`.
10. Storage: review copy and encrypted original as separate EXIF-free R2 objects; `MediaRef` holds `evidenceDigest`, key id, EXIF booleans.

## 3. API (contributor, SIWE session cookie)

| Route | Behaviour |
|---|---|
| `POST /v1/auth/siwe/nonce`, `POST /v1/auth/siwe/verify` | EIP-4361 behind `ContributorAuth` |
| `GET /v1/consent/terms`, `POST /v1/consent` | versioned terms per purpose and licence scope |
| `GET /v1/contributor/tasks?cell=` | open Tasks with reward per accepted observation |
| `POST /v1/contributions` (multipart, `taskId`, image) | runs §2; returns `{ contributionId, status }` |
| `GET /v1/contributions/{id}` | `verifying` \| `accepted` \| `rejected{reason}` \| `in_review` \| `appealed` |
| `POST /v1/contributions/{id}/appeal` | only within 48 h of the rejection notice; keeps reserve coverage while pending (Q13.5) |
| `POST /v1/consent/withdraw` | observations become non-eligible for future aggregates; delivered results and committed rewards unchanged (E6) |

Rejection reasons: `duplicate`, `illegible`, `total_mismatch`, `out_of_criteria`, `quota_full`, `contributor_cap_reached`.

## 4. Data model additions

`contributors` (wallet, separate from observations), `consents` (version, purpose, scope, withdrawn_at), `contributions`, `observations` (states per parent Data model, `synthetic` flag, `fiscal_key` unique, `sha256` unique), `media_refs`, `review_queue`, `appeals`, `reward_entries` (state `verified_pending_commitment`).

## 5. Acceptance criteria (Seam 1, `Extractor` and R2 faked, PostgreSQL real)

| ID | Behaviour |
|---|---|
| M3-AC1 | Full happy path through the public API ends `accepted` with a `verified_pending_commitment` reward entry. |
| M3-AC2 | Stored objects have no EXIF; only the three booleans persist; no GPS anywhere in DB or logs. |
| M3-AC3 | Same fiscal key or same `sha256` → `duplicate`, no second reward entry (E3, I3), including under concurrent uploads. |
| M3-AC4 | QR total ≠ extracted total → rejected or in review, never accepted (E4). |
| M3-AC5 | Task at `maxRewardedObservations` → `quota_full`; 4th accepted upload by one wallet in a Task → `contributor_cap_reached`. |
| M3-AC6 | Fake redaction with low confidence → internal review, no external call recorded. |
| M3-AC7 | Appeal after 48 h → rejected; within 48 h → `appealed` and reserve coverage kept. |
| M3-AC8 | Consent withdrawal removes observations from eligibility (I13) and leaves reward entries unchanged. |
| M3-AC9 | Fraud flag before commitment → observation `revoked`, its reward entry cancelled (E11). |
| M3-AC10 | Logs captured during the suite contain no image bytes, names, DNI, CUIT of buyer or card digits (I9). |

## 6. Entry, exit, blocked (copied from the parent)

- **Entry:** S3 report; `Extractor` provider chosen.
- **Exit (verifiable):** Upload → EXIF booleans and strip → QR → dedupe → extraction → checks → redacted review copy → accept/reject/review, all through the public API; appeals.
- **Blocked when:** Redaction cannot keep personal data out of the review copy.

## 7. Edit surfaces

```text
apps/api/src/contributor/**
apps/api/src/ingestion/**
apps/api/src/storage/**
apps/api/src/db/schema/**
apps/api/drizzle/**
apps/api/test/**
apps/contributor-web/**
packages/domain/**
odd/specs/m3-ingestion.md
```

## 8. Dependencies

M2a (API, DB) and M2b (provider, thresholds). Parallel with M1. M4 consumes accepted observations.
