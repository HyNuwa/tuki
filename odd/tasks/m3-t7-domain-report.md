# T7 handoff — S9 and S11

2026-11-17. Member: maximiliano. All edits are inside `packages/domain/**`.
No other worker, install, repository-wide formatter, Git mutation, `.env` read,
real receipt, model execution, push, deployment or remote session was used.

## Outcome

- S9: removed the old review editor/domain types, provenance/warning functions
  and seven-state vocabulary. Only the three specified final states remain.
  Existing atomic money/quantity helpers retain their original behavior.
- S11: implemented strict `ticket.v1`, exact E6 decimal normalization, E7
  numeric/text comparison, tie-breaks, character/multiline/original-image boxes,
  uninterpreted lines, V1–V8, all five subscores, configurable weights/tolerances/
  thresholds/cap, state/reason selection, accepted-only allowlisted dataset,
  caller-keyed HMAC-SHA256, issuer privacy and final personal-pattern filtering.
- All country-specific rules are in `src/countries/ar.ts`, behind the exported
  `CountryModule` interface. A synthetic second module exercises the generic
  stages without source changes. The ARCA QR reader preserves decimal JSON
  number tokens exactly and drops recipient data.
- `today`, versions, HMAC key, OCR evidence and original-image geometry are
  explicit inputs. No clock, environment, storage or models are read.
- Public entry points and integration responsibilities: `README.md`.

## Files

Modified: `src/index.ts`.

Removed: `src/review.ts`, `test/domain.test.ts`, `test/review.test.ts`.

Added source: `src/schema.ts`, `src/types.ts`, `src/config.ts`, `src/decimal.ts`,
`src/normalize.ts`, `src/anchor.ts`, `src/validate.ts`, `src/score.ts`,
`src/dataset.ts`, `src/pipeline.ts`, `src/countries/ar.ts`.

Added tests: `test/schema.test.ts`, `test/normalization.test.ts`,
`test/anchoring.test.ts`, `test/validation.test.ts`, `test/score.test.ts`,
`test/dataset.test.ts`, `test/qr.test.ts`, `test/pipeline.test.ts`,
`test/money.test.ts`, `test/synthetic.ts`.

Added documentation: `README.md`, `T7-REPORT.md`.

## RED → GREEN evidence

Each major stage was implemented after its public-boundary tests failed;
synthetic fixtures only. No internal mocks or new test dependencies.

| Boundary | Observed RED | Observed GREEN |
|---|---|---|
| Schema | `test/schema.test.ts`: 16 failed against unimplemented boundary | 16 passed, then additional sparse-array regression |
| E6 / country module | `test/normalization.test.ts`: 27 failed | 27 passed |
| E7 | `test/anchoring.test.ts`: 21 failed | 21 passed |
| E8 | `test/validation.test.ts`: 26 failed | 26 passed |
| E9 | `test/score.test.ts`: 12 failed | 12 passed |
| Dataset / HMAC / privacy | `test/dataset.test.ts`: 16 failed | 16 passed |
| ARCA QR | Valid lossless QR fixture failed against empty reader | 7 passed including invalid-QR controls |
| Assembly | `test/pipeline.test.ts`: 7 failed against unimplemented boundary | 8 passed including the final-state control |
| S9 public exports | `test/money.test.ts`: seven labels instead of three | 2 passed; retained money helpers passed before and after |
| Additional regressions | Sparse-array acceptance; reversed multi-line item order; missing multi-line box union; reused keyword line; partial OCR decoy each observed failing before correction | All passed; inclusive 0.85/0.60 controls also pass |

Independent HMAC reference: Python standard-library `hmac.digest` confirmed the
committed public synthetic test vector, without a runtime dependency on Python.

## Command results

- `pnpm --filter @tuki/domain test`: exit 0, **144 tests / 9 files passed**.
- `pnpm --filter @tuki/domain typecheck`: exit 0, no diagnostics.
- `git diff --check -- packages/domain`: exit 0; Git only warned that the tracked
  `src/index.ts` will use CRLF when Git next touches it.
- `pnpm -r typecheck`: exit 1, `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`, contributor-web
  fails on the removed manual-review API; domain completed successfully.
- `pnpm --filter @tuki/api typecheck`: exit 1, independently captured the API
  migration failures below because recursive pnpm bails on the first package.

## Exact downstream diagnostics — intentionally not fixed

Paths in this section are relative to the named application. These failures
belong to T8/T9, not to this domain-only edit surface.

### apps/api

```text
src/app.ts(5,10): error TS2305: Module '"@tuki/domain"' has no exported member 'arithmeticWarnings'.
src/app.ts(5,30): error TS2305: Module '"@tuki/domain"' has no exported member 'createReview'.
src/app.ts(5,53): error TS2305: Module '"@tuki/domain"' has no exported member 'reviewProvenance'.
src/app.ts(30,42): error TS2322: Type '"accepted" | "processing_error" | "rejected"' is not assignable to type '"extraction_ready" | "fiscal_pending" | "needs_review" | "processing" | "processing_error" | "reviewed" | "uploaded" | PgColumn<ColumnBaseConfig<ColumnDataType, string>, {}, {}> | SQL<...> | undefined'.
  Type '"accepted"' is not assignable to type '"extraction_ready" | "fiscal_pending" | "needs_review" | "processing" | "processing_error" | "reviewed" | "uploaded" | PgColumn<ColumnBaseConfig<ColumnDataType, string>, {}, {}> | SQL<...> | undefined'.
src/app.ts(48,26): error TS2345: Argument of type '"processing"' is not assignable to parameter of type '"accepted" | "processing_error" | "rejected"'.
src/app.ts(52,28): error TS2345: Argument of type '"extraction_ready"' is not assignable to parameter of type '"accepted" | "processing_error" | "rejected"'.
src/app.ts(53,28): error TS2345: Argument of type '"needs_review"' is not assignable to parameter of type '"accepted" | "processing_error" | "rejected"'.
src/app.ts(94,63): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'PgColumn<{ name: "state"; tableName: "contributions"; dataType: "string"; columnType: "PgEnumColumn"; data: "extraction_ready" | "fiscal_pending" | "needs_review" | "processing" | "processing_error" | "reviewed" | "uploaded"; ... 9 more ...; generated: undefined; }, {}, {}>' is not assignable to parameter of type 'never'.
src/contributor/review.ts(1,42): error TS2305: Module '"@tuki/domain"' has no exported member 'Draft'.
src/contributor/review.ts(1,54): error TS2305: Module '"@tuki/domain"' has no exported member 'Review'.
src/contributor/review.ts(14,31): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/contributor/review.ts(16,46): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/db/schema.ts(2,15): error TS2305: Module '"@tuki/domain"' has no exported member 'Draft'.
src/db/schema.ts(2,22): error TS2305: Module '"@tuki/domain"' has no exported member 'Extraction'.
src/db/schema.ts(2,34): error TS2305: Module '"@tuki/domain"' has no exported member 'Provenance'.
src/db/schema.ts(2,46): error TS2305: Module '"@tuki/domain"' has no exported member 'Review'.
src/ingestion/bridge.ts(6,15): error TS2305: Module '"@tuki/domain"' has no exported member 'Extraction'.
```

### apps/contributor-web

```text
src/App.tsx(2,52): error TS2305: Module '"@tuki/domain"' has no exported member 'Review'.
src/App.tsx(51,54): error TS2367: This comparison appears to be unintentional because the types '"accepted" | "processing_error" | "rejected"' and '"needs_review"' have no overlap.
src/App.tsx(80,123): error TS2322: Type '"processing"' is not assignable to type '"accepted" | "processing_error" | "rejected"'.
src/App.tsx(89,10): error TS2367: This comparison appears to be unintentional because the types '"accepted" | "processing_error" | "rejected"' and '"fiscal_pending"' have no overlap.
src/ReviewEditor.tsx(2,10): error TS2305: Module '"@tuki/domain"' has no exported member 'arithmeticWarnings'.
src/ReviewEditor.tsx(2,30): error TS2305: Module '"@tuki/domain"' has no exported member 'createReview'.
src/ReviewEditor.tsx(2,44): error TS2305: Module '"@tuki/domain"' has no exported member 'fieldProvenance'.
src/ReviewEditor.tsx(2,61): error TS2305: Module '"@tuki/domain"' has no exported member 'missingFields'.
src/ReviewEditor.tsx(2,103): error TS2305: Module '"@tuki/domain"' has no exported member 'updateItem'.
src/ReviewEditor.tsx(2,120): error TS2305: Module '"@tuki/domain"' has no exported member 'ItemField'.
src/ReviewEditor.tsx(2,136): error TS2305: Module '"@tuki/domain"' has no exported member 'Provenance'.
src/ReviewEditor.tsx(2,153): error TS2305: Module '"@tuki/domain"' has no exported member 'Region'.
src/ReviewEditor.tsx(2,166): error TS2305: Module '"@tuki/domain"' has no exported member 'Review'.
src/ReviewEditor.tsx(17,35): error TS7031: Binding element 'x' implicitly has an 'any' type.
src/ReviewEditor.tsx(17,74): error TS7031: Binding element 'y' implicitly has an 'any' type.
src/ReviewEditor.tsx(21,123): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/ReviewEditor.tsx(31,22): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/ReviewEditor.tsx(32,26): error TS7006: Parameter 'discount' implicitly has an 'any' type.
src/ReviewEditor.tsx(42,43): error TS7006: Parameter 'region' implicitly has an 'any' type.
src/ReviewEditor.tsx(61,34): error TS7006: Parameter 'region' implicitly has an 'any' type.
src/ReviewEditor.tsx(61,161): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/ReviewEditor.tsx(62,73): error TS7006: Parameter 'region' implicitly has an 'any' type.
src/ReviewEditor.tsx(76,28): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/ReviewEditor.tsx(76,34): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/ReviewEditor.tsx(77,47): error TS7006: Parameter 'row' implicitly has an 'any' type.
src/ReviewEditor.tsx(85,163): error TS7006: Parameter 'row' implicitly has an 'any' type.
src/ReviewEditor.tsx(91,32): error TS7006: Parameter 'discount' implicitly has an 'any' type.
src/ReviewEditor.tsx(91,42): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/ReviewEditor.tsx(92,186): error TS7006: Parameter 'row' implicitly has an 'any' type.
src/ReviewEditor.tsx(92,191): error TS7006: Parameter 'n' implicitly has an 'any' type.
src/ReviewEditor.tsx(93,172): error TS7006: Parameter 'row' implicitly has an 'any' type.
src/ReviewEditor.tsx(93,177): error TS7006: Parameter 'n' implicitly has an 'any' type.
src/ReviewEditor.tsx(94,112): error TS7006: Parameter '_' implicitly has an 'any' type.
src/ReviewEditor.tsx(94,115): error TS7006: Parameter 'n' implicitly has an 'any' type.
src/ReviewEditor.tsx(100,24): error TS7006: Parameter 'warning' implicitly has an 'any' type.
src/ReviewEditor.tsx(100,33): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/ReviewEditor.tsx(100,59): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ total_mismatch: string; line_mismatch: string; discounts_unresolved: string; }'.
src/ReviewEditor.tsx(100,145): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/ReviewEditor.tsx(104,45): error TS7006: Parameter 'line' implicitly has an 'any' type.
src/ReviewEditor.tsx(104,51): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/ReviewEditor.tsx(106,60): error TS2367: This comparison appears to be unintentional because the types '"accepted" | "processing_error" | "rejected"' and '"reviewed"' have no overlap.
src/ReviewEditor.tsx(107,48): error TS2367: This comparison appears to be unintentional because the types '"accepted" | "processing_error" | "rejected"' and '"reviewed"' have no overlap.
src/api.ts(1,15): error TS2305: Module '"@tuki/domain"' has no exported member 'ArithmeticWarning'.
src/api.ts(1,53): error TS2305: Module '"@tuki/domain"' has no exported member 'Draft'.
src/api.ts(1,60): error TS2305: Module '"@tuki/domain"' has no exported member 'Extraction'.
src/api.ts(1,72): error TS2305: Module '"@tuki/domain"' has no exported member 'Provenance'.
src/api.ts(1,84): error TS2305: Module '"@tuki/domain"' has no exported member 'Review'.
test/app.test.tsx(5,10): error TS2305: Module '"@tuki/domain"' has no exported member 'createReview'.
test/app.test.tsx(5,29): error TS2305: Module '"@tuki/domain"' has no exported member 'Draft'.
```

## Deliberately not claimed

- No 15-photo regression/accuracy, model latency or RAM benchmark: task permits
  synthetic fixtures only and model-dependent assumptions belong to T6.
- No test of x402 database permissions, retention purge or persistence of
  invalid GLM attempts: those require I/O and belong to T8 integration tests.
- No official locality catalog is bundled. Without a supplied verified catalog,
  locality and region are `null`; this is the specified non-derivable fallback.
- No native review, independent verifier, commit, bitacora or estado edit:
  coordinator-owned. No subagents were started.
- No external scratch directories were created. Vitest uses its existing,
  ignored dependency/cache locations; no test writes receipt artifacts.
- Engram review/read, save and session-summary calls were blocked by the host hook: `Codex host session is not
  registered; start a new Codex session to register it`. No session ID was
  invented or registered.

## Next step

Coordinator verifies the domain unit, writes its bitacora/estado entry and owns
Git; T8/T9 migrate the intentionally broken consumers. Keep model-dependent
implementation behind T6 evidence and the official locality-catalog choice.

Risk: item 2 (dataset privacy and caller-keyed HMAC); item 3 (intentional removal
of shared manual-review exports and states consumed by API and web).

## Key Learnings

1. Fiscal identifiers must anchor after scored fields and stay outside coverage associations so optional fiscal metadata cannot change extraction quality.
2. ARCA numeric JSON amounts require lossless token parsing before JSON conversion, even when their integer portion is only thirteen digits.
3. Multi-line item ordering must use the last supporting line, and numeric anti-reuse must take precedence over keyword preference.
