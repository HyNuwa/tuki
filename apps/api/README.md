# Automatic contributor API (M3 / T8)

Hono on loopback `127.0.0.1:8787`, PostgreSQL 16 and Drizzle. The automatic
pipeline supersedes manual review. This remains **local synthetic-only staging**,
not a publicly deployable service: authentication, contributor ownership, legal
approval, real-photo regression accuracy and the 4 GB VM resource gate are open.
No Redis, external extraction provider, R2, model downloader or model server is
started by this application.

## Configuration

Set variables in the terminal or service configuration. The application does not
load `.env` files. Never commit credentials or receipt artifacts.

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | Local PostgreSQL 16 application connection. |
| `STORAGE_DIR` | Absolute volume outside the physical repository, including symlink/junction resolution. |
| `DATASET_HMAC_KEY` | Stable secret, at least 32 UTF-8 bytes. No default; never rotate without an explicit dataset migration. |
| `OCR_PYTHON` | Existing pinned Python 3.12 OCR environment executable. |
| `OCR_MODELS_DIR`, `OCR_CACHE_DIR` | Existing private pinned PP-OCRv6 small assets/cache. |
| `OLLAMA_URL` | Default `http://127.0.0.1:11434`; only literal loopback HTTP, no credentials, path or redirects. |
| `GLM_OCR_MODEL` | Default `tuki-glm-ocr-q4km`, the spike's locally derived Q4_K_M model. Must already exist in Ollama. |
| `GLM_TIMEOUT_MS` | Inference HTTP timeout, default 120000. |
| `JOB_TIMEOUT_MS` | Whole-job timeout; default `OCR_TIMEOUT_MS + 2 * GLM_TIMEOUT_MS + 30000` (390000). Smaller explicit budgets are rejected at startup. |
| `OCR_TIMEOUT_MS` | Combined E1-E4 preparation/OCR budget, default 120000. |
| `OCR_MIN_SIDE` | Minimum original short edge, default 600 pixels. |
| `OCR_MIN_SHARPNESS` | Minimum Laplacian variance, default 100. Initial, not calibrated. |
| `OCR_MIN_CONFIDENCE` | Mean OCR confidence threshold, default 0.6. |
| `OLLAMA_PID` | Optional local Linux Ollama server PID, used only for process-family RSS measurement. |

The extractor reads the exact versioned prompt and forced-format schema from
`spikes/ticket-pipeline/`. It uses `/api/tags` to require Q4_K_M and capture the
model digest, then `/api/generate` with image-only input, temperature/seed zero,
CPU, two threads, 8192 context tokens and a 4096 output-token cap. `keep_alive=0`
unloads GLM after inference. OCR text is **never** supplied to GLM. Ollama is a
separate, operator-managed process; the API does not discover credentials,
download models, start it or change its configuration.

```powershell
pnpm --filter @tuki/api db:migrate
pnpm --filter @tuki/api dev
```

Migrations are explicit, not automatic on startup. Python reuses the existing
worker's pinned CPU engine, asset verification, bounded regions and offline
runtime. A persistent JSON-lines child keeps PP-OCRv6 resident across successful
jobs. E1-E3 are model-free; E4 and E5 are sequential. Timeouts kill and await the
OCR process tree before the queue slot is released. There are no image scratch
files in the new Python bridge. Infrastructure failures reset the child.
The Python child receives only explicitly selected OS/temp/PATH values, fixed
Python runtime flags and OCR model/cache settings; database credentials and the
dataset HMAC key are never inherited.

## Queue and persistence

E0 stores the exact original bytes using immutable SHA-256 addressing, then
commits a ticket, artifact reference and `jobs` row. Exact duplicates return the
existing ticket, with no extra job. There is no normalized-image dedupe that can
silently change the original digest.

A session advisory lock enforces concurrency one across cooperating worker
instances, in addition to an in-process guard and a unique running-job index.
Each claim uses `SELECT ... FOR UPDATE SKIP LOCKED` in a short transaction.
Queued/running job states are not ticket states. The final ticket states are
only `accepted`, `rejected`, `processing_error`, with the domain's Spanish labels.
Infrastructure failures get **three total attempts** (initial plus two retries),
then `error_interno`; content failures never requeue. E5 alone retries invalid
JSON/schema responses, per-inference timeouts and output/token-limit failures
once, then returns `extraccion_invalida` without queue retry. Failed model
attempts retain `complete=false` and a stable `reason`; timeout/oversized HTTP
envelopes store empty raw text when no complete model string could be decoded.
Connection refusal/unreachable Ollama and whole-job timeout remain infrastructure
failures. An abandoned running row is recovered
only while holding the database-wide worker lock; each artifact write is fenced
by the current job token and the held connection.

Internal tables: `tickets`, `jobs`, `ticket_artifacts`, `model_attempts`,
`job_runs`. `dataset_records` is separate and contains only the domain-generated,
accepted-only privacy-filtered dataset. Every available model response is stored
untouched before JSON validation, with queue/model attempt numbers, model digest,
versions and duration. Invalid responses are not repaired or replaced with OCR
values. The E6 VAT suffix cleanup changes only the normalized item description;
its raw value and E7 matching remain literal.

The complete internal result, boxes, OCR, image transform, SHA-256, perceptual
hash, stage timings E0-E9, combined E6-E9 timing and per-attempt metrics are stored.
Domain timing uses an optional caller-clock observer; it changes neither domain
output nor the required arguments of `processTicket`.

Memory metrics distinguish Node RSS, Python lifetime high-water RSS and sampled
Ollama process-family RSS. With `OLLAMA_PID` on Linux, `peakRamBytes` is a
conservative sum of component peaks; process-family RSS can double-count shared
pages and 100 ms sampling can miss short peaks. Without complete measurement,
`peakRamBytes` is `null` and `memory.complete=false`, not a fabricated pass.
Neither measurement mode proves the 3 GB budget on the deployment VM.

## Read-only web contract

All responses are `Cache-Control: no-store`. There is no application request,
image, OCR, model-output or exception-content logging.

- `GET /v1/health` -> `{status:"ok"}`.
- `GET /v1/consent` -> `{version,text}`. The initial text covers extraction,
  dataset sale, 30-day internals, erasure and unrecoverable purchased copies;
  **legal approval remains a deployment gate**.
- `POST /v1/contributions`: multipart `image` (one PNG/JPEG/WebP, 1 byte–5 MiB),
  required uppercase `country`, `consent=true`, current `consentVersion`, optional
  `synthetic=true`. Decoded pixels are limited to 4 million by E1. HEIC is not
  enabled by the existing pinned decoder profile. Returns **202** with queued
  detail, or **200** with the existing ticket for the same original bytes.
  Unsupported countries produce a terminal `pais_no_soportado` ticket without
  running a model. Invalid file/country/consent envelopes use stable 4xx codes.
- `GET /v1/contributions?state=accepted&jobStatus=succeeded`: newest-first history;
  either filter is optional. Final `state` values only; use `jobStatus` for work
  in progress. Summary includes `id,country,state,label,synthetic,createdAt,
  processedAt,errorCode,jobStatus`.
- `GET /v1/contributions/:id`: `id,country,state,label,synthetic,createdAt,
  processedAt,purgedAt,errorCode,result,versions,metrics,job,ocr,geometry,
  imageAvailable`. `state` and `label` are **null while queued/running**; `job`
  contains `{id,status,attempts}`. `result` is the domain result without its
  dataset property; fields/items retain anchoring data until retention.
- `GET /v1/contributions/:id/result` -> `{result,job}`.
- `GET /v1/contributions/:id/image`: preprocessed metadata-free PNG only, or 404.
  Original images/EXIF are never returned through this route. OCR boxes are in
  the original raster's coordinates; `geometry.toOriginal` is the homography
  from the displayed preprocessed raster back to that original. The web must
  apply the inverse when drawing field boxes over this image.
- `GET /v1/dashboard` -> `{total,counts,jobs}` derived from persisted rows.

`PUT .../review`, `POST .../complete-review`, and manual `POST .../retry` are
removed (404). There are no field-editing endpoints. T9 should upload once, poll
detail while `job.status` is `pending`/`running`, and show the final read-only
result, reasons, scores, OCR evidence and uninterpreted text.

## Retention and erasure

The service runs `purgeExpired` before processing jobs and hourly thereafter.
At the country retention age (AR: 30 days after terminal processing), it deletes
both images, OCR lines, raw attempts and all raw/normalized field copies, item
fields, uninterpreted text and fiscal/QR metadata. It conservatively drops all
field values rather than trying to identify buyer text after the fact. Hashes,
quality scores, subscores, validations, versions and the dataset survive. Shared
content-addressed images are kept until their last reference is purged. Old,
unreferenced objects left by a crash/rolled-back upload are also swept, with
per-object transaction locks protecting concurrent uploads.

`eraseTicket(db,storage,id)` is the operator-only erasure seam: it removes the
dataset and internal records/objects under the worker lock. It is not a public
editing endpoint. Authentication and authorization of a user's erasure request
belong to the later ownership/auth layer.

Migration `0001_automatic_pipeline.sql` is additive. Historical M3 contributions,
observations/reviews and media are not reinterpreted as automatically accepted
results or served by these endpoints. Their buyer-bearing artifacts follow the
same 30-day purge, counted from legacy creation. `src/db/legacy.ts` preserves
migration metadata only; the old states are not active ticket states. Keep the
legacy schema until a separately reviewed retirement migration is authorized.

The migration requires permission to create the non-login role
`tuki_dataset_reader` when absent. It grants SELECT only on `dataset_records`
and revokes internal-table privileges from that role and PUBLIC. Operators must
provision a separate buyer login/member with no extra grants; the application
credential must never be reused by x402. No buyer login or password is created
or committed here.

## Verification

```powershell
pnpm --filter @tuki/domain test
pnpm -r typecheck
pnpm --filter @tuki/api test
# From spikes/s3-extraction/ocr-worker, using the existing private Python:
& $Python -B -m unittest discover -s tests -v
```

The API suite is serial and starts one PostgreSQL 16 Testcontainer. Its HTTP
server is a **fake Ollama**, and OCR/evidence/memory are synthetic test doubles;
no PP-OCRv6/GLM model is loaded. Python tests use invented images and injected
engines. Docker failure is missing required proof, not permission to replace
PostgreSQL with a mock or restart Docker. Testcontainers stops its own container;
the integration test prints its synthetic scratch path and removes that owned
fixture after the suite, with the resolved target checked beneath the OS temp
directory before removal. Earlier retained task scratch is not selected.
