# Contributor API (M3 phase 1)

Hono on loopback port 8787, PostgreSQL **16**, Drizzle migrations and the existing local Python OCR/parser. No wallet/authentication, redaction, fiscal validation, external extraction, R2 or deployment. Use synthetic non-personal receipts only. This is not a publicly deployable service.

## Local environment

Set environment variables in the terminal; do not commit them. The app does not load `.env` automatically.

- `DATABASE_URL`: a local PostgreSQL 16 connection URI.
- `STORAGE_DIR`: absolute directory **outside the repository**, for normalized PNG evidence.
- `OCR_PYTHON`: existing private Python environment executable.
- `OCR_MODELS_DIR`, `OCR_CACHE_DIR`: existing private worker models/cache directories.

```powershell
pnpm install --frozen-lockfile
pnpm --filter @tuki/api db:migrate
pnpm --filter @tuki/api dev
# In a second terminal:
pnpm --filter @tuki/contributor-web dev
```

The browser uses relative `/api/v1/...`; Vite removes `/api` when forwarding to the API. Migrations are explicit, never run automatically on application startup. One API process owns the OCR slot. The worker timeout is 120 seconds; the bridge kills its process tree on timeout. CPU OCR is synchronous per upload, but its persisted `processing` state is visible to concurrent history/detail requests.

## Public routes

All responses use `Cache-Control: no-store`. No application request/body logging is installed. Errors have only a stable `code`.

- `GET /v1/health`
- `POST /v1/contributions`: multipart `image` (exactly one PNG/JPEG/WebP, 1 byte–5 MiB, at most 4 million decoded pixels), optional `synthetic=true`. Returns 201 with the persisted record, including `processing_error` if OCR failed; screening failures use 4xx and stable codes. Dedupe uses SHA-256 of the normalized raster. EXIF is inspected in Python memory, only three booleans survive, and all persisted image metadata is removed. GPS is never stored.
- `GET /v1/contributions?state=needs_review`: newest first; optional exact state.
- `GET /v1/contributions/:id`: immutable draft/OCR, current review, field provenance, warnings and step outcomes.
- `GET /v1/contributions/:id/image`: metadata-free PNG, no filesystem path in response.
- `PUT /v1/contributions/:id/review`: current review JSON (`merchant`, `date`, `voucher`, `items`, `discounts`, `total`). Empty unknown values are valid; malformed nonempty money/quantity is rejected. Evidence region references are rebuilt from the original draft, never trusted from edits. Saving marks `reviewed`; it does not fix arithmetic.
- `POST /v1/contributions/:id/complete-review`: only `reviewed` → `fiscal_pending`.
- `POST /v1/contributions/:id/retry`: only `processing_error`; retries the same normalized evidence without creating a duplicate record. A missing local image remains an error and requires a new image, not fabricated OCR.
- `GET /v1/dashboard`: counters grouped from actual persisted records.

The `MediaStorage` port in `src/storage/media.ts` currently has only a local-volume adapter. A future R2 adapter is a separate task and requires authorization; no R2 variables or SDKs are used here.

## Verify

```powershell
pnpm -r test
pnpm -r typecheck
pnpm --filter @tuki/contributor-web build
# Use OCR_PYTHON for all demo/parser/CLI tests:
& $env:OCR_PYTHON -B -m unittest discover -s spikes/s3-extraction/demo/tests -v
```

API integration starts real `postgres:16.13-alpine` using Testcontainers. Only the OCR bridge is faked. Docker must be running: a Docker failure is a failed required check, not a reason to substitute a database mock.
