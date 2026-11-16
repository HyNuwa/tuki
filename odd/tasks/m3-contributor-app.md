# M3 contributor app — phase 1 (real app, staging)

Objective: turn the local receipt-review demo into the real monorepo app (`apps/api` Hono + PostgreSQL 16 + Drizzle, `apps/contributor-web` React + Vite with the "Tira térmica" design), ready for a Fluence CPU staging VM. Branch `feat/m3-contributor-app` (from `feat/m2b-s3-extraction` at `1d11149`). Delivery: work-unit commits on the branch, no push or PR. Tests: Vitest; API integration against real PostgreSQL 16 via Testcontainers (Q10).

## Specs

- S1. Scope is M3 phase 1 only. Out of this phase (still M3, later or blocked): SIWE / `ContributorAuth`, consent, Tasks and quotas/caps, fiscal QR, `Extractor` vision LLM (S3 provider undecided), R2 storage, appeals, consent withdrawal, rewards. Stack per `odd/specs/mvp-p0.md` Q10; owner is Maximiliano (Alexxe left the team).
- S2. pnpm monorepo at the repo root: `pnpm-workspace.yaml` with `apps/*` and `packages/*` only (spikes keep their own lockfiles); Node `24.14.0`, pnpm `10.32.1`; exact pinned versions; TypeScript strict as in `spikes/s3-extraction/tsconfig.json`; one root lockfile.
- S3. `packages/domain` (pure, no I/O): money atomic parse/format without floats (port `spikes/s3-extraction/demo/src/review.ts` and its tests), value provenance `extracted | corrected | missing`, arithmetic warnings that are never auto-corrected (items sum vs total, quantity × unit price vs line total), and the contribution states with these exact labels: uploaded "Cargado", processing "Procesando", extraction_ready "Extracción disponible", needs_review "Requiere revisión", reviewed "Revisión completada", fiscal_pending "Validación fiscal pendiente", processing_error "Error de procesamiento". Forbidden labels anywhere: Aceptado, Verificado, Apto para agregación, Entregable, Recompensa aprobada.
- S4. `apps/api` (Hono): `GET /v1/health`; `POST /v1/contributions` (single PNG/JPEG/WebP image, ≤ 5 MiB, ≤ 4 MP) → screening, EXIF read in memory then stripped (GPS never stored), sha256 dedupe (`duplicate` rejection), OCR + parser through the existing Python worker, persisted outcome per step; `GET /v1/contributions` (history, newest first, filter by state); `GET /v1/contributions/{id}` (state, draft, OCR regions, review, provenance, warnings); `PUT /v1/contributions/{id}/review` (save edits beside the immutable OCR/draft); `POST /v1/contributions/{id}/complete-review` (reviewed → fiscal_pending); `GET /v1/dashboard` (counters derived from records only); `GET /v1/contributions/{id}/image` (normalized, metadata-free image). Errors are stable codes only, never exception text, paths or receipt content; logs never contain images, OCR text or personal data.
- S5. OCR bridge: reuse `spikes/s3-extraction/ocr-worker/worker.py`, `spikes/s3-extraction/demo/receipt_parser.py` and the demo's image normalization through one Python CLI invoked as a subprocess (config `OCR_PYTHON`, `OCR_MODELS_DIR`, `OCR_CACHE_DIR`; one OCR at a time, 120 s timeout, `ocr_busy` / `ocr_timeout` / `ocr_unavailable`). No new OCR engine, no external calls. Tests fake the bridge at its boundary.
- S6. Storage: PostgreSQL tables `contributions`, `observations`/drafts, `reviews` (edits with provenance), `media_refs` (normalized image digest, EXIF booleans); `synthetic` flag; `sha256` unique. Images go to a local `STORAGE_DIR` volume outside Git (R2 later). Drizzle migrations committed.
- S7. `apps/contributor-web` (React + Vite PWA): port the screens of `design/contributor-pwa/index.html` — Panel, Cargar (picker, drag and drop, preview, validation), Procesando, Error con reintento, Revisión editable (provenance marks, OCR region highlight and sticky crop, add/remove/correct lines, warnings), Detalle, Historial with filters, Módulos "EN DESARROLLO" (the 11 listed in `PRODUCT.md`). Visual system and tokens from `DESIGN.md` and the already ported `spikes/s3-extraction/demo/src/style.css` (self-hosted fonts). Calls the API at relative `/api` (no `VITE_*` secrets). Neutral Spanish copy. Final normal state shows "VALIDACIÓN FISCAL PENDIENTE". Demo data labeled exactly "DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES".
- S8. Deploy (later task, needs explicit remote authorization): Docker Compose with Caddy (HTTPS, static PWA, `/api/*` proxy), API, OCR worker and PostgreSQL on Fluence VM `cpu-shared-3vcpu-4gb`; identifiers live in the untracked `.env`. Staging with synthetic data only. Adding Docker/Caddy/Fluence amends Q10 and is Risk item 5.

## Tasks

| ID | Specs | Route | Status | Commit |
|---|---|---|---|---|
| T1 | S1–S3 | Codex worker (Orca) | pending | — |
| T2 | S4–S6 | Codex worker (Orca) | pending | — |
| T3 | S7 | Codex worker (Orca) | pending | — |
| T4 | S8 | parent, after authorization | pending | — |

## Log

- L1 (2026-11-15, user): "ya puse en .env asi que arranca el M3 completo si no tarda mucho" — and earlier "respondiendo a tu pregunta app real si". Mid-turn: "delega tareas a codex te recomiendo para ahorro de tokens".
- L2: Full M3 is not short and is partly blocked (M2a not built; S3 Extractor provider, R2 and SIWE wallet undecided), so per the user's condition this phase covers the real app without those parts. Docker Desktop engine was not running on 2026-11-15; Testcontainers needs it.
