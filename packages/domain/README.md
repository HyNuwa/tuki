# Ticket pipeline domain

Pure, deterministic E6–E9 functions for `ticket.v1`. There are no model,
filesystem, database, network, environment-variable or clock reads here.
`processTicket` is asynchronous only because the dataset uses Web Crypto HMAC.

## Entry points

- `validateTicketV1(unknown)` / `parseTicketJson(raw)`: strict recursive schema
  validation. No omitted keys, extra keys, non-string leaves or JSON repair.
- `normalizeTicket(ticket, country)`: flattened field paths, literal `raw` and
  canonical `valor`. Amounts and quantities remain decimal strings.
- `anchorTicket(normalized, lines, country, geometry, config?)`: exact numeric
  evidence, edit-distance text evidence, deterministic tie-breaking, original
  image boxes and `texto_no_interpretado`. OCR array order is reading order.
- `validateTicket(anchored, country, { today, qr?, existingTickets? }, config?)`:
  V1–V8. `today` is an explicit ISO date, not the machine clock. Pass logical
  summaries from `logicalTicket` for duplicate checks; exclude the current
  ticket from that list when reprocessing it.
- `scoreTicket(validation, lines, country, config?)`: all five subscores, final
  two-decimal score, cap, threshold, final state and rejection reason. V1/V7/V8
  are informational. V5 and verified total evidence remain mandatory even if
  a configured threshold is lower than the unverified-total cap.
- `createDatasetRecord(id, validation, score, country, hmacKey)`: explicitly
  allowlisted record for accepted tickets only. Never spread an internal object
  into an external response. `hmacKey` is caller-supplied bytes; the application
  must load a stable secret from outside the repository and database.
- `processTicket(input, countryRegistry?, config?)`: assembles the above stages.
  The default registry contains only Argentina. Unsupported countries return
  `pais_no_soportado` before examining extraction or OCR input. Malformed E5
  output returns `extraccion_invalida` with no score. Invalid trusted geometry,
  configuration or missing HMAC key throws a stable internal error; the worker
  must map infrastructure/programming failures to `error_interno`.
- `processingError(id, country, reason)`: error envelope for E0/E1/E4/E5 failures.

Persist raw GLM attempts **before** validating them. The service owns E0–E5,
retry policy, raw artifact persistence, consent, retention, model versions and
database permissions. Do not call the E6–E9 entry point instead of performing
E4's empty/low-confidence OCR gate. Queue states are not ticket states.

## Configuration and countries

`defaultPipelineConfig` contains initial global weights (0.35/0.25/0.25/0.10/0.05),
threshold (0.85), total cap (0.50), text thresholds (0.85/0.60), item-line distance
(2) and optional tolerance overrides. Without overrides, V3 uses the module's
currency minimum unit and V4 uses its total tolerance. These are starting values,
not calibrated accuracy claims. Preserve the caller-supplied weights/prompt/model
version identifiers alongside each result.

Country formatting, fiscal identifiers, issuer classification, keywords,
monetary-line detection, QR interpretation, personal patterns, locality lookup
and retention live behind `CountryModule`. The Argentina module's two-digit
year century is explicitly configurable (initially 2000); changing it requires
re-running regression tests and versioning the module. No locale is inferred
from the image or machine.

`createArgentinaModule({ localidades })` accepts an externally verified locality
catalog; without one, locality/region are `null`. No unofficial catalog or
geographic guess is bundled. Ambiguous names also produce `null`.

The Argentina QR reader follows the [official ARCA QR v1 specification](https://arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf).
Numeric JSON tokens are preserved as strings before parsing, so amounts never
pass through binary floating point. Only issuer/voucher comparison fields are
returned; recipient identity fields are excluded.

## Migration from manual review

The final labels are only `Aceptado`, `Rechazado`, `Error de procesamiento`.
The exported state keys are `accepted`, `rejected`, `processing_error`.
Manual-review types, editing functions, provenance and arithmetic-warning APIs
are removed; V3/V4 replace the old warnings without repairing printed values.
The unchanged `parseMoney`, `moneyForEditor` and `parseQuantity` helpers remain
available for migration, with their locale rules inside the Argentina module.
API/database and contributor-web callers must migrate in T8/T9, not via a
compatibility layer that reinstates superseded states.

## Verification

```sh
pnpm --filter @tuki/domain test
pnpm --filter @tuki/domain typecheck
pnpm -r typecheck
```

All committed fixtures are invented. Database-role isolation, raw-attempt
persistence, retention and the 15-photo regression benchmark require service
integration tests and are not claimed by this pure package.
