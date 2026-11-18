# T9 handoff — contributor web on the automatic pipeline

2026-11-18. Specs: `odd/tasks/m3-contributor-app.md` T9 / S9 / S13; normative flow `odd/specs/ticket-pipeline.md` §§4, 6, 8; API contract `apps/api/src/app.ts` and `odd/tasks/m3-t8-api-report.md` "T9 consumption contract". No Git mutation, dependency change, `.env` read, Docker, model run or remote operation.

## Specs covered

- **S9:** the web serves only «Aceptado», «Rechazado», «Error de procesamiento» (labels from `@tuki/domain` `stateLabels`). `ReviewEditor.tsx` is deleted; no review, complete-review, retry or any write call except the upload remains. Retired labels (Requiere revisión, Revisión completada, Validación fiscal pendiente) no longer appear.
- **S13:** upload with declared country, processing (polling), read-only result (state, score, threshold, five sub-scores, reason, fields and items with anchoring state and OCR region on the image, uninterpreted text), history. No editing controls anywhere (asserted by a test).

## Screens

- **Panel:** total, three final-state counters, queue lines "En cola" (`jobs.pending`) and "Procesando" (`jobs.running`).
- **Cargar:** existing picker/drag-drop/validation/preview; country select (Argentina default; UY, CL, PY, BO, BR listed with a note that they end in `pais_no_soportado`); consent text and version from the API with a required checkbox; synthetic samples. Upload error keeps "Reintentar carga" (re-sends the same upload, not a processing retry).
- **Processing:** chip + heading "En cola"/"Procesando" (aria-live), scan bar (removed under reduced motion), attempt count when > 1. Polls every 2.5 s; stops on final, unknown or network error ("Volver a consultar"). A 200 re-upload shows "Esta imagen ya estaba cargada…".
- **Result:** state sticker; Aceptado note "«Aceptado» no es una validación fiscal"; reason panel for Rechazado/Error in plain Spanish (12 reason codes mapped; unknown codes get a generic text) plus the 0,50 cap note when V6 failed and "Cargar otra foto"; score/threshold/sub-scores as dotted leaders with the lowest marked; fields grouped Comercio/Comprobante/Totales/Pago and Ítems, each with mark + state in words (+ OCR text for dudoso, "Sin evidencia" for no verificado) and "Ver en la imagen" toggling the region on the image plus an inline crop under the row (works on mobile without scrolling to the image); "Texto no interpretado" list with regions; purge notice when `purgedAt` is set; image fallback text when unavailable.
- **Historial:** filters Todos + three final states (`?state=`); rows show final label or queue status.
- **Unknown state:** any non-final, non-queue combination (unknown `state`, finished job without state, missing job) shows "Estado desconocido" and stops polling.

State colors (DESIGN.md's dated note leaves the mapping open; derived within the palette): Aceptado mint, Rechazado yellow, Error coral, queue cyan, unknown paper-2. Anchoring marks: verificado filled ink square, dudoso half-filled square + yellow-soft wash, no verificado coral diamond + coral-soft wash, faltante hollow square + faint value. DESIGN.md itself was not edited (outside surface).

## API endpoints consumed

`GET /v1/dashboard`, `GET /v1/consent`, `POST /v1/contributions` (image, country, consent=true, consentVersion, synthetic=true; 202/200), `GET /v1/contributions?state=`, `GET /v1/contributions/:id`, `GET /v1/contributions/:id/image`. Not used: `/result` (detail already carries it), `jobStatus` filter, `/health`. Geometry: field and uninterpreted boxes are original-raster; the web inverts `geometry.toOriginal` (3x3 adjugate) and draws over the preprocessed PNG sized by its natural dimensions.

## Gaps (not worked around)

1. **Consent text is English** (`CONSENT_TEXT` in `apps/api/src/app.ts`) while the UI is Spanish. Shown verbatim with `lang="en"` because it is the versioned text being consented to; a Spanish text needs an API/legal change.
2. **No ownership/authentication:** history and dashboard are global, not per contributor (T8 A7). S13 "history" is shown as the API exposes it.
3. **No supported-country list endpoint:** the web hardcodes AR as the only module; adding a country needs a web change.
4. **Field paths have no API labels:** Spanish labels for `ticket.v1` paths live in `src/ticket.ts`; new schema paths fall back to the raw path.
5. Retained-result shape after purge is assumed to drop `campos`/`items`/`texto_no_interpretado`; the UI tolerates either.
6. DESIGN.md still documents the retired state map and data-origin marks; a docs follow-up should record the new map above. Unused review-pane CSS from the demo port remains in `style.css` (dead, harmless).

## Test evidence

- RED: `pnpm --filter @tuki/contributor-web test` failed with `Cannot find module '../src/ticket.js'` and the old App importing removed domain exports.
- GREEN: 17 tests in 3 files. `test/ticket.test.ts` (phase mapping incl. unknown, all 12 reasons, anchoring/field labels, score format, homography inverse/identity/singular, error codes); `test/app.test.tsx` (panel counters without retired labels; upload sends country/consent/version and polls En cola → Procesando → Aceptado then no further requests; accepted result read-only with all four anchoring states, uninterpreted text, no inputs/edit buttons, only GET requests, selected region polygon `20,10 120,10 120,22 20,22` from an original box under a ×2 transform, inline crop; rejected and error reasons; history filter request; unknown state; poll network error stops polling and recovers on "Volver a consultar"; image type/pixel validation); existing cache-policy test. Fixtures in `test/fixtures.ts` are synthetic and typed against the API DTOs.
- One bounded visual pass (desktop 1366 and mobile ~390/500) against a scratch mock of the T8 API: no horizontal overflow (scrollWidth ≤ viewport), region highlight and crop correct, live polling sequence En cola → Procesando → Aceptado observed. Fixes from that pass: show the literal `raw` value ("300,00") instead of canonical `valor`; smaller reason footnote. Impeccable detector: advisories only (incumbent off-scale values; my crop radius moved to 14px).

| Command | Observed result |
| --- | --- |
| `pnpm --filter @tuki/contributor-web typecheck` | exit 0 |
| `pnpm --filter @tuki/contributor-web test` | exit 0, 17 passed (3 files) |
| `pnpm --filter @tuki/contributor-web build` | exit 0, offline shell 11 static resources, receipt APIs excluded |
| `pnpm -r typecheck` | exit 0 (domain, contributor-web, api) |
| `git diff --check -- apps/contributor-web` | clean |

Not verified: real API + real pipeline end-to-end (needs PostgreSQL/Docker and Ollama), physical phone, native PWA install.

## Scratch

The parent session scratchpad, outside the repo (mock server `server.mjs`, `detect.json`); removed by the parent. Mock and dev servers stopped.

Risk: none (UI-only; the manual-review removal and the new upload fields were requested and follow the T8 API; behavior is covered by tests).
