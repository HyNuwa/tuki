# Contributor PWA

React + Vite, neutral Spanish copy, self-hosted fonts and the established **Thermal Strip** visual system from `DESIGN.md` and the working local demo. Workspace domain helpers are reused rather than copied into the UI.

## Local run

Start the API as described in [`../api/README.md`](../api/README.md), then:

```powershell
pnpm --filter @tuki/contributor-web dev
```

Open `http://127.0.0.1:5173`. Vite forwards relative `/api/v1/...` to `http://127.0.0.1:8787/v1/...`; no `VITE_*` secrets or direct OCR credentials are used in the browser.

For the existing private runtime on this PC, set these in the **API terminal** (never commit an environment file):

```powershell
$runtime = Join-Path $env:LOCALAPPDATA 'tuki-ocr-worker/local-v6-ab00gv2v'
$env:OCR_PYTHON = Join-Path $runtime 'venv/Scripts/python.exe'
$env:OCR_MODELS_DIR = Join-Path $runtime 'models'
$env:OCR_CACHE_DIR = Join-Path $runtime 'demo-cache'
# DATABASE_URL must reference a local PostgreSQL 16 instance.
# STORAGE_DIR must be an absolute local directory outside this repository.
pnpm --filter @tuki/api db:migrate
pnpm --filter @tuki/api dev
```

No private path is shipped to the browser. Do not use real personal-data receipts: authentication, redaction, encrypted evidence, retention and R2 are outside this phase.

## Screens and evidence

- Panel: counters from the API, never fabricated history.
- Cargar: picker, drag/drop, type/size/pixel validation and local preview. Both public examples are synthetic images processed by the **real** OCR, not canned response payloads. `scripts/generate-samples.py` documents their generation; it reuses the demo fixture and adds deliberately ambiguous printed data/inconsistent totals.
- Processing/error/retry: actual request status; failed OCR retries the existing contribution.
- Review: original OCR polygons, sticky crop, editable merchant/date/voucher, quantities, units, printed amounts, discounts and add/remove lines. Every visible field has provenance; corrected values retain their original reading. Warnings never modify values. Save persists edits beside immutable evidence; complete moves only to fiscal pending.
- Detail/history: persisted states and newest-first state filters.
- Eleven future modules show `EN DESARROLLO` without fake functionality.

## PWA privacy

`pnpm --filter @tuki/contributor-web build` generates a manifest and versioned service worker. The worker caches an explicit static-shell allowlist only. API responses, receipt images, OCR, reviews and sample requests are excluded. Nothing is written to localStorage or IndexedDB. Offline opens only the shell; it does not simulate OCR, history or queued uploads. Native installation is not automatic and has not been proved by the embedded browser.

```powershell
pnpm --filter @tuki/contributor-web test
pnpm --filter @tuki/contributor-web typecheck
pnpm --filter @tuki/contributor-web build
```
