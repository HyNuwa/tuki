# Local receipt-review PWA

A same-PC demonstration: **synthetic image → real local OCR → conservative draft → editable review**.
This is not M3 ingestion, Extractor revision 2, fiscal verification, redaction, accepted observations or a commercial dataset.
Every draft and saved in-memory review remains `needs_review`, fiscal `pending` and `commercialEligible: false`.

## Run on this PC

Use the existing private CPython 3.12/PaddleOCR runtime and models from the worker setup; no new model download is needed.
Node `24.14.0` and pnpm `10.32.1` match the existing spike. All frontend versions are exact in the isolated package and lock.

```powershell
pnpm --dir spikes/s3-extraction/demo install --frozen-lockfile --ignore-scripts
pnpm --dir spikes/s3-extraction/demo build

# Set these to your existing private runtime, model and cache locations outside Git.
$Python = '<private-runtime>/venv/Scripts/python.exe'
$Models = '<private-runtime>/models'
$Cache = '<private-runtime>/demo-cache'
& $Python -B spikes/s3-extraction/demo/server.py --models-dir $Models --cache-dir $Cache
```

Open **http://127.0.0.1:8765**. `--port` selects another loopback port (1024–65535).
The server intentionally has no bind-address option: no LAN, HTTPS setup, tunnel, camera access, remote service or deploy.
The existing worker still runs in an isolated child process with its pinned models, CPU settings and Python network guard.
The bridge is a local development server, not an OS sandbox or production API.

## Rehearse the three cases

1. **Ticket legible**: select the built-in synthetic example, then **Extraer datos**. Expected products: two units of milk at ARS 1,250.00, one bread at ARS 850.00, total ARS 3,350.00. Inspect the actual OCR text and polygon coordinates.
2. **Impresión defectuosa**: the generated image has a deliberately unreadable quantity and mild blur. OCR is real, never replaced with a canned response. Exact OCR errors can vary. Unknown quantity/unit price stay empty; correct fields only from visible evidence. This is an editing demonstration, not a calibrated OCR benchmark.
3. **Ticket incompleto**: the generated image lacks readable prices/total. Expect no invented product amounts and a request for review. Manually add data only if demonstrable in the image; otherwise leave it unknown.

Use the file selector for other **synthetic or test images without personal data**. Limits: PNG/JPEG/WebP, single image, 5 MiB compressed, 4 million decoded pixels. No existing private corpus is scanned or copied.
The UI is neutral Spanish, mobile-first and responsive, but this session does not configure or test a physical phone.

## Parser and review boundaries

`parse_receipt(ocr)` consumes validated OCR regions. It groups spatially aligned fragments and supports explicit printed rows of `quantity x unit-price description line-total`, description/line-total rows and one unambiguous `TOTAL`.
Supported money forms have exactly two printed decimals (`1.250,00`, `1250,00`, `1250.00`); editor amounts use comma decimals and optional dot grouping. No float money, recomputed line totals, balancing adjustments, inferred quantity one or invented fiscal values.
Unsupported layouts, taxes/discounts and ambiguous totals remain unresolved evidence. The draft currency is the demo's explicit ARS context, not currency identification from the receipt. This narrow parser is not a general Argentine-receipt extractor.
Source region IDs remain attached to parsed rows. Manual rows have no fabricated evidence IDs. Raw OCR evidence is immutable; edits live separately. **Conservar borrador en esta sesión** creates an in-memory structured snapshot, not database persistence or acceptance.

## Local HTTP seam and privacy

- `GET /api/health`: local-service status, never receipt content.
- `GET /api/examples/{legible,degraded,incomplete}.png`: generate the synthetic image in memory.
- `POST /api/extract`: raw image bytes, matching image `Content-Type`, `X-Tuki-Demo: 1`, same-origin request. Response contains normalized preview, actual OCR regions, draft and elapsed time.
- Host/origin checks reject foreign web origins and DNS-rebinding hostnames; no permissive CORS. One OCR child at a time; concurrent extraction gets `429 ocr_busy`. Child timeout: 120 seconds. Errors contain stable codes only, no exception text or paths.
- Decode and normalize in memory before writing a metadata-free PNG to a newly owned per-request temporary directory outside Git. The original upload/EXIF/GPS is never written. That request deletes only its own temporary directory on completion/failure. Process crashes/forced termination can leave temporary files; this is not secure deletion or a production retention policy.
- The static shell serves only `.html`, `.js`, `.css`, `.svg`, `.png`, `.webmanifest` and self-hosted `.woff2` fonts from `dist/`.
- Images, OCR, edits and saved reviews are never stored in localStorage, IndexedDB, service-worker caches, application logs or the repository. The process still holds data in memory during processing. Do not use this demo for personal-data receipts or claim redaction safety.

## PWA and offline behavior

The build emits a manifest, 192/512 PNG icons and a versioned service worker. In a compatible desktop browser use its install menu; the embedded preview does not prove native installation. No installation is performed automatically.
Only an explicit same-origin static-shell allowlist is cached. `/api/` requests, images, OCR responses and query-string URLs are excluded. After first load the empty shell can open with the server stopped, but extraction and generated examples require the local process. There is no offline OCR simulation or queued upload.
After rebuilding, an already open app can still show the prior shell while its new worker activates; reopen/reload after activation. Live drafts are not automatically reloaded away. A browser may retain prior shell versions until worker activation completes.

References: [installable PWAs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [Python development-server limits](https://docs.python.org/3.12/library/http.server.html).

## Verify

```powershell
Push-Location spikes/s3-extraction/demo
& $Python -B -m unittest discover -s tests -v
pnpm test
pnpm build
Pop-Location
pnpm --dir spikes/s3-extraction test
pnpm --dir spikes/s3-extraction typecheck
```

Existing worker tests must run from `spikes/s3-extraction/ocr-worker`, using its documented command. No private receipt data is a test fixture. The parent spike's default Vitest discovery also includes the four nested demo tests (235 total instead of 231); the original checker tests/source are unchanged.
This demo does not close T3, supply the missing calibration/held-out corpus, freeze privacy truth, choose thresholds or establish M2b viability.
