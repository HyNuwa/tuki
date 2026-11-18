# T8 handoff — automatic API ticket pipeline

2026-11-17. Specs: `odd/tasks/m3-contributor-app.md` T8 / S9 / S12;
normative flow, stages and persistence: `odd/specs/ticket-pipeline.md` §§3, 4, 9.
Member: maximiliano. No commit, staging, stash/reset, dependency installation,
helper worker, `.env` read, real-model execution, deployment or remote operation.

## Outcome and scope

- **S9 implemented:** only the three domain final states are served. Manual
  review, complete-review and manual retry routes are removed. Upload is queued;
  history, status, result, dashboard and image routes are read-only thereafter.
- **S12 implemented:** immutable original/SHA-256, declared country and recorded
  versioned consent; PostgreSQL jobs with SKIP LOCKED and concurrency one;
  bounded infrastructure retries/timeouts; existing-worker E1-E4 evolution;
  local Ollama Q4_K_M E5; existing domain E6-E9 and accepted-only dataset;
  artifact/version/timing persistence, separate dataset privileges, retention
  and operator erasure. VM RAM and real-photo/model quality are **not verified**.
- Original allowed surfaces were respected. The coordinator additionally
  authorized `packages/domain/src/pipeline.ts` solely for an optional timing
  observer. `packages/domain/src/anchor.ts` was **not changed**: the coordinator
  explicitly retained E7 matching on the literal raw description.

## Decisions and implementation

1. E0 stores exact original bytes at `<sha256>.original`, using immutable create
   semantics and digest verification; no original/EXIF download endpoint exists.
   A transaction creates `tickets`, `ticket_artifacts`, and `jobs`. Exact repeated
   bytes return the existing ticket (200), not another job; new work returns 202.
   Country and explicit current consent are required before persistence.
2. A PostgreSQL session advisory lock spans a job, while its row claim uses a
   short `FOR UPDATE SKIP LOCKED` transaction. An in-process guard and a partial
   unique running-job index provide additional exclusion. Claim tokens fence
   writes. The held connection is checked before artifacts/terminal persistence.
   Running rows left by a crashed owner are recovered only under the global
   lock, without exceeding three total attempts. Infrastructure failure kills
   and awaits the Python process tree before requeue/release. Content failures
   finish once; invalid E5 output gets exactly one inference-level retry.
3. `ocr-worker/pipeline_worker.py` reuses `worker.py` CPU model verification,
   `paddle_engine`, region validation and offline controls. Its persistent
   JSON-lines process keeps PP-OCRv6 small resident; no second OCR engine or
   image scratch runtime was introduced. It screens side/sharpness, computes
   pHash, corrects EXIF and quadrilateral perspective/tilt, falls back to EXIF
   only, decodes optional QR on the original and returns literal lines/boxes.
   OpenCV/numpy were already pinned transitive dependencies; nothing installed.
4. E5 uses the exact committed prompt and JSON format file, image only, CPU,
   temperature/seed zero and output/HTTP limits. Literal loopback HTTP only;
   redirects/credentials/remote hosts are rejected. `/api/tags` supplies the
   served digest and requires Q4_K_M. The configured model defaults to the
   spike's `tuki-glm-ocr-q4km`; the app never starts Ollama or downloads weights.
   Raw response strings, including invalid whitespace/content, are persisted
   before parsing, with queue/model attempt numbers and versions.
5. E6 strips exactly one bounded trailing VAT-rate token from `valor`, preserving
   `raw`; `(ROJO)` and other parentheses remain. E7 remains unchanged. The public
   pipeline test verifies raw `LECHE (21,00)` against OCR `LECHE (21,00) 2.500,00`
   yields normalized `LECHE`, literal raw and `verificado`. Empty model amounts
   remain missing; V4/V5 reject them and no dataset row is emitted.
6. E6-E9 still call the authoritative `processTicket`, never an API reimplementation.
   The optional stage observer receives stage/phase and a timestamp from the
   caller-injected clock. With no observer the domain reads no clock; observed
   and unobserved output are deep-equal. All E0-E9 durations are recorded.
7. Dataset records are emitted only by the domain and stored separately. A stable
   environment HMAC key is required; no default/rotation/DB secret is introduced.
   Small domain-generated logical-duplicate metadata is stored separately, so
   subsequent jobs do not load prior raw OCR/results into memory.
8. Retention deletes images, full OCR, model outputs, all field/item copies and
   uninterpreted/fiscal/QR data; it keeps hashes, scores/subscores, validations,
   versions and dataset. It handles shared image references, legacy artifacts
   and old unreferenced crash objects. Per-object transaction locks protect the
   orphan sweep from uploads. Erasure also deletes the dataset, without adding
   a public editing endpoint.
9. Memory metadata distinguishes Node RSS, Python lifetime high-water RSS and
   optional 100 ms Linux Ollama process-family RSS sampling via operator-supplied
   `OLLAMA_PID`. All spawning threads are inspected to include Go's runner child.
   Complete component measurement produces a conservative summed peak;
   unavailable measurement remains null/incomplete, never a claimed 3 GB pass.

## Migration notes

- `0001_automatic_pipeline.sql` adds `tickets`, `jobs`, `ticket_artifacts`,
  `model_attempts`, `job_runs`, `dataset_records`, queue constraints/indexes and
  a non-login `tuki_dataset_reader` role. Its snapshot includes the existing
  schema and matches the declared new Drizzle schema.
- No old contribution/review is silently converted to an automatic acceptance.
  `src/db/legacy.ts` retains historical migration definitions only. Legacy
  images, drafts and reviews are purged after 30 days from legacy creation;
  the old rows/states are not served by the new API. Retiring those tables is
  a separate reviewed migration, not a destructive drop in this task.
- Migration requires permission to create the reader role when absent. Operators
  provision a separate buyer login with no extra privileges; x402 must use that
  credential and only `dataset_records`, never the application credential.
- Existing storage containment/junction checks remain. Originals now deliberately
  preserve the full source bytes under the private volume and 30-day retention;
  browser images remain metadata-free preprocessed PNGs.

## Verification — observed, foreground and serial

| Command | Observed result |
| --- | --- |
| `pnpm --filter @tuki/domain exec vitest run test/normalization.test.ts` | RED: four VAT cases failed; GREEN: 34 passed after the change. |
| `pnpm --filter @tuki/domain exec vitest run test/instrumentation.test.ts` | RED: no stage events; GREEN: ordered E6-E9 events and identical output. |
| Focused new API unit tests before implementation | RED: missing Ollama/pipeline/queue/memory modules; then GREEN at their public seams. |
| `pnpm --filter @tuki/domain test` | **153 passed, 11 files**. |
| `pnpm -r typecheck` | Domain passes; contributor-web fails with the expected T9/manual-review diagnostics below. |
| `pnpm --filter @tuki/api typecheck` | **Pass**; T7 API diagnostics removed. |
| `pnpm --filter @tuki/domain typecheck` | **Pass**. |
| `pnpm --filter @tuki/api exec vitest run --exclude test/api.test.ts` | **11 passed, 7 files**; no Docker/model loads. |
| Existing Python, from `spikes/s3-extraction/ocr-worker`: `$Python -B -m unittest discover -s tests -v` | **38 passed**; injected engines/synthetic images only, including seven new pipeline tests. |
| `pnpm --filter @tuki/api test` | One full serial Docker run: **26 passed, 1 failed** out of 27; retention failure described below. |
| Coordinator-authorized `pnpm --filter @tuki/api exec vitest run test/api.test.ts -t purges` | **1 passed, 15 intentionally skipped**, real PostgreSQL 16 Testcontainer. |
| Scoped `git diff --check` | **Pass**. |

The initial full run found a real retention defect: a JavaScript `Date` interpolated
into raw Drizzle SQL lacked a column encoder, and postgres-js rejected it before
serialization. The query now passes ISO text with an explicit `timestamptz` cast.
The coordinator authorized exactly one focused Docker recheck; it passed all
retention assertions. **The complete suite was not rerun after this correction,
per instruction; the parent's independent verifier will run it once.** No failed
check is hidden as a full-suite pass.

The full run already observed successful real-PostgreSQL tests for accepted /
rejected / processing-error results, immutable original/artifacts/versions,
raw invalid outputs, accepted-only dataset, three-attempt infrastructure/timeout
limits, content no-retry, E4 short-circuit, SKIP LOCKED, cross-instance concurrency,
crash recovery, simultaneous-upload idempotency, reader-role denial and erasure.
The focused correction run supplied the missing complete retention proof.

### Contributor-web diagnostics (T9, outside this surface)

`pnpm -r typecheck` still reports only the obsolete web consumer:

- `src/App.tsx:2`: removed `Review`; lines 51/80/89: `needs_review`, `processing`
  and `fiscal_pending` no longer belong to the final-state union.
- `src/ReviewEditor.tsx:2`: removed `arithmeticWarnings`, `createReview`,
  `fieldProvenance`, `missingFields`, `updateItem`, `ItemField`, `Provenance`,
  `Region`, `Review`. Its callback implicit-any diagnostics (lines 17-104) follow
  those removed editor types; lines 106-107 still compare `reviewed`.
- `src/api.ts:1`: removed `ArithmeticWarning`, `Draft`, `Extraction`, `Provenance`,
  `Review`; `test/app.test.tsx:5`: removed `createReview`, `Draft`.

No web files were changed. API and domain typechecks pass independently.

## T9 consumption contract

The full route/DTO/error/config contract is in `apps/api/README.md`.

- Fetch `GET /v1/consent`, collect explicit consent, upload `image`, `country`,
  `consent=true`, `consentVersion`, optional `synthetic=true`.
- New upload is 202; exact-byte duplicate is 200 with the same ID/job.
- Poll `GET /v1/contributions/:id`: `state`/`label`/`result` are null until final;
  use `job.status` (`pending`, `running`, `succeeded`, `failed`) and `attempts`.
- Final `result` is the domain result without its dataset property. Use its
  fields/items, validations, score/subscores/threshold, reason and uninterpreted
  text. OCR is `ocr: OcrLine[] | null`, not the old regions/draft/review object.
- Field boxes are original-raster coordinates. `/image` serves the preprocessed
  PNG, so invert `geometry.toOriginal` for field overlays. Full OCR lines remain
  in the processed coordinate space. After purge, image/OCR/geometry and field
  copies are absent; scores/subscores remain available.
- History accepts final `state` and/or `jobStatus`, newest first. Dashboard
  separates final-state `counts` from queue `jobs`. No review, completion or
  manual-retry editing calls remain.

## Open risks / coordinator work

- VM RAM is unverified: the spike observed about 3.4-4.3 GB for Q4 on the PC
  against a 3 GB worker budget. Optional RSS instrumentation is not a VM capacity
  verdict. No real model, VM or real-photo regression was run here.
- Extraction quality, long tickets, initial thresholds/weights, locality catalog
  and legal/consent approval remain the explicitly recorded deployment gates.
- PNG/JPEG/WebP retain the existing pinned upload/decoder profile. HEIC from the
  broader pipeline spec is **not enabled**; it needs an approved decoder profile
  rather than an unrequested dependency installation.
- Authentication/ownership, public deployment, x402 login provisioning and durable
  process supervision remain outside this local synthetic-only service.
- Parent owns independent high-risk verification, final full-suite rerun, review,
  member log/state updates, commit slicing and T9. No native review or Git mutation
  was attempted by this worker.
- Engram calls are blocked by the host's unregistered-session hook; this local
  report is the recovery handoff. No session identity was invented/registered.

Natural reviewable boundaries: (1) domain VAT cleanup and optional instrumentation;
(2) additive schema/storage/queue/retention and role boundary; (3) resident Python
stages and bridge lifecycle; (4) Ollama/domain orchestration, read-only endpoints,
startup and integration tests. Generated migration snapshots are not authored
logic. These are natural slices, not an artificial 400-line acceptance limit.

## Retained scratch

Both contain only synthetic test images. They were not deleted by this worker:

- `%TEMP%/tuki-t8-api-test-WbQgsL` — initial full API run.
- `%TEMP%/tuki-t8-api-test-ijVVvC` — authorized focused retention recheck.

Testcontainers stopped each owned container. Existing Python/startup fixture
cleanup remains fixture-owned; no pre-existing scratch was selected or removed.

Risk: item 1 (additive DB migration and persistence); item 2 (original/buyer-data
retention, HMAC/dataset separation and consent); item 3 (removed manual-review API
and changed upload/result contract); item 4 (global queue exclusion, timeouts and
child-process ordering).

## Key Learnings

1. Raw Drizzle SQL needs ISO timestamp text or an explicit encoder instead of a JavaScript Date parameter.
2. VAT suffix cleanup belongs to the normalized value while literal OCR anchoring must retain the original description.
3. A session-wide PostgreSQL lock and short SKIP LOCKED claims provide distinct global-concurrency and row-selection guarantees.
4. Retention must remove duplicated raw text inside anchored result fields, not only OCR and model-output tables.

## Correction batch — B1, A9, A5, A10, A11 (2026-11-17)

Baseline: the coordinator reported independent domain 153, API typecheck,
Python 38 and API Testcontainers 27/27 passing at `e2bac0f`. This follow-up is
one bounded correction batch; no other advisory was implemented, no dependency
was added, and no Git mutation or real-model execution was performed.

### Corrected items

- **B1:** `generate()` now returns a failed model attempt for its own inference
  deadline (`inference_timeout`) and the 2 MiB envelope limit
  (`ollama_output_limit`). Both retain `raw=""`, `complete=false`, model identity
  and a stable reason when no complete model response string could be decoded.
  HTTP-envelope fragments are not repaired or misrepresented as literal model
  output. The pipeline persists each attempt, retries E5 once, then returns
  `extraccion_invalida`; the queue finishes after one job attempt and does not
  rerun E1-E4. Token-limited decoded responses retain their actual raw string.
  Connection refusal, metadata/transport failures and whole-job cancellation
  remain infrastructure failures. The new real-PostgreSQL tests assert both
  failed persisted rows, final state/motivo, one E1/E4 execution and no requeue.
- **B1 timeout budget:** `OCR_TIMEOUT_MS` bounds combined E1-E4 (default 120000).
  The default whole-job budget is derived as `OCR_TIMEOUT_MS + 2 *
  GLM_TIMEOUT_MS + 30000` (390000 with defaults). Metadata lookups are bounded
  separately; startup rejects an explicit job budget below that minimum.
- **B1 persistence:** additive migration `0002_model_attempt_reason.sql` adds
  nullable `model_attempts.reason`. It does not rewrite historical attempts.
- **A9:** the VAT suffix pattern now exists only in the AR module's
  `normalizar_descripcion_item` implementation. The country interface exposes
  that policy, and generic E6 delegates to it. Existing AR tests retain identical
  behavior/raw values; a synthetic non-AR policy proves E6 does not impose AR's
  suffix cleanup on another module. E7/anchoring is unchanged.
- **A5:** Python receives an explicit allowlist: OS PATH/temp/SystemRoot values,
  fixed Python runtime flags and configured OCR model/cache settings. It no
  longer inherits application/environment secrets or Python import overrides.
  A real spawned fake-child test verifies `DATASET_HMAC_KEY` and `DATABASE_URL`
  are absent without printing any environment values.
- **A10:** the API integration fixture removes only its freshly allocated
  `tuki-t8-api-test-*` directory in teardown. It first verifies the resolved
  absolute target's parent and prefix, and asserts ENOENT after removal. Earlier
  task/verifier scratch is not selected or deleted.
- **A11:** worker README distinguishes fresh environment-creation examples from
  the actual executable of an existing private installation; paths are described
  generically for Windows and Linux, without a user-specific venv locator.

### RED and final verification

RED before implementation, as recorded by the first worker (the B1 RED is also
reproduced by the coordinator's probe output):

- `test/model-attempts.test.ts`: both cases threw out of the public
  `executeTicket` path (`TimeoutError`, `ollama_output_limit`) instead of
  persisting attempts and returning a content failure.
- Country-policy test: the generic normalizer stripped the synthetic other
  country's suffix despite its explicit identity policy.
- Python-child test: the secret-presence boolean was true.
- Startup test: an insufficient explicit job budget incorrectly reached the
  listener instead of returning `configuration_invalid`.

Final foreground checks, run serially with no heavy work in parallel:

| Command | Observed result |
| --- | --- |
| `pnpm --filter @tuki/domain test` | **154 passed**, 11 files; all existing VAT/anchoring behavior remains covered. |
| `pnpm --filter @tuki/domain typecheck` | **Pass**. |
| `pnpm --filter @tuki/api typecheck` | **Pass**. |
| Existing private Python, from `spikes/s3-extraction/ocr-worker`: `$Python -B -m unittest discover -s tests -v` | **38 passed**, synthetic/injected engines only. |
| B1 probe (fake Ollama whose `/api/generate` hangs, `timeoutMs` 300) | `RESULT {"estado":"Error de procesamiento","motivo":"extraccion_invalida"} generates 2 persisted [ 'E2', 'E4', 'E5', 'E5' ]` (before the fix: `THROWN TimeoutError`, 1 generate, no E5). |
| `pnpm --filter @tuki/api test` | **Not proven.** Docker daemon unreachable (Docker Desktop Linux engine pipe missing): `api.test.ts` failed in `beforeAll`, 9 other files passed (16 tests passed, 18 skipped). The Testcontainers queue tests for B1 (no requeue, two persisted failed rows) and the A10 teardown still need one run with Docker up. |
| Scoped `git diff --check` | **Pass**. |

A first worker's report of a passing 34-test API run could not be confirmed and
is replaced by the observed result above. The parent's recheck should remain
limited to B1/A9/A5/A10/A11, not a new advisory sweep.

### Explicitly open follow-ups — not fixed in this batch

- **A1:** shutdown cancellation still consumes queue attempts.
- **A2:** perceptual-hash duplicate detection remains exact-match and its extra
  duplicate mark remains outside the domain pipeline.
- **A3:** a seeded legacy-artifact purge-row integration test is still missing.
- **A4:** unsupported MIME still returns 415 rather than creating an
  `Error de procesamiento` ticket; HEIC support remains unimplemented.
- **A6:** logical duplicate rows are still loaded per job.
- **A7:** status/result endpoints remain unauthenticated; public deployment stays
  gated on authentication and ownership.
- **A8:** peak RAM / the 3 GB budget remain unproven on the target VM.

### Scratch and ownership

The integration fixture prints its `tuki-t8-api-test-*` directory under the OS
temp directory and its teardown removes it (A10); with Docker down this run never
reached fixture allocation. Workers created no retained manual scratch and did
not delete earlier task scratch or the coordinator's probe directory.
Git, member log/state updates, commit and the bounded independent recheck remain
coordinator-owned.

Risk: items 1 (additive reason-column migration), 2 (Python credential boundary),
3 (country-module interface and timeout configuration), 4 (model/job deadlines).

## Correction Key Learnings

1. A model inference deadline is an E5 attempt outcome, distinct from whole-job cancellation or an unreachable transport.
2. Persisting failed-attempt reason codes enables calibration without exposing exception contents or inventing partial model text.
3. Country-specific description cleanup belongs behind the same country-module boundary as fiscal and numeric rules.
