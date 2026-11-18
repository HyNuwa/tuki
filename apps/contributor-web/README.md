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

No private path is shipped to the browser. Do not use real personal-data receipts: authentication, ticket ownership and R2 are outside this phase, and the status/result endpoints are unauthenticated. The full API runtime (Ollama GLM-OCR, HMAC key, job budgets) is in the API README.

## Screens and evidence

The app follows the automatic pipeline in [`odd/specs/ticket-pipeline.md`](../../odd/specs/ticket-pipeline.md). There is no manual review, editing, correction or manual retry anywhere.

- Panel: counters from `GET /v1/dashboard` for the three final states («Aceptado», «Rechazado», «Error de procesamiento») plus queue work ("En cola", "Procesando"), never fabricated history.
- Cargar: picker, drag/drop, type/size/pixel validation and local preview; declared country (default `AR`; other countries end in «Error de procesamiento» because only AR has a module); the versioned consent text from `GET /v1/consent` must be accepted before `POST /v1/contributions`. Both public examples are synthetic images.
- Processing: polls `GET /v1/contributions/:id` every 2.5 s while `job.status` is `pending`/`running`; stops on a final state, an unknown state or a network error (with "Volver a consultar"). An exact-byte re-upload (200) opens the existing ticket.
- Result (read-only): state sticker, reason (`motivo`) in plain Spanish for «Rechazado» and «Error de procesamiento», score and threshold, the five sub-scores (the lowest marked when it is the reason), every extracted field and item with its anchoring state (verificado, dudoso, no verificado, faltante — shape, wash and words, not color alone) and "Ver en la imagen", which highlights the OCR region on the preprocessed image and shows an inline crop under the field. Field boxes are in original-raster coordinates, so the app applies the inverse of `geometry.toOriginal`. Uninterpreted text (`texto_no_interpretado`) is listed with its regions. After retention purge, only state and scores are shown.
- Historial: newest first, filtered by final state; queued tickets show their queue status.
- Eleven future modules show `EN DESARROLLO` without fake functionality.

State colors (refining DESIGN.md's dated amendment, within its palette): «Aceptado» mint (score reached the threshold, not a fiscal validation), «Rechazado» yellow, «Error de procesamiento» coral, queue work cyan.

## PWA privacy

`pnpm --filter @tuki/contributor-web build` generates a manifest and versioned service worker. The worker caches an explicit static-shell allowlist only. API responses, receipt images, OCR, results and sample requests are excluded. Nothing is written to localStorage or IndexedDB. Offline opens only the shell; it does not simulate processing, history or queued uploads. Native installation is not automatic and has not been proved by the embedded browser.

```powershell
pnpm --filter @tuki/contributor-web test
pnpm --filter @tuki/contributor-web typecheck
pnpm --filter @tuki/contributor-web build
```
