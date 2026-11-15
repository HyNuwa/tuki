# S3 extraction and selective-redaction viability

**Verdict: INCONCLUSIVE / NO QUALIFYING M2b EXPERIMENT RUN.** This is not a completed M2b exit. Ten user-attested team receipts were processed by the local raw-OCR worker only; just three currently have complete visible item/monetary Argentine annotations, and privacy ground truth is not frozen. There is no held-out partition, structured Extractor result, redaction output or provider benchmark. Three earlier web examples remain excluded.

Date: 2026-11-15. Coordinator: Maximiliano, under the user's explicit authorization. Scope: [M2b](../odd/specs/m2-s3-extraction-spike.md). Procedure: [S3 protocol](../spikes/s3-extraction/PROTOCOL.md).

## Corpus and execution

| Item | Target / current evidence |
|---|---|
| Distinct consented team receipts | Target 100; ten private candidates supplied and locally processed, three with complete visible item/monetary Argentine annotations. Two retained known web-example hashes are excluded. |
| Calibration / held-out split | Target 20 / 80; actual partial calibration 10 / held-out 0. The pilot is not frozen. |
| Stores, printers and quality strata | Ten candidates include Argentine and foreign-jurisdiction controls plus cropped/incomplete examples; only three are currently complete Argentine annotations. |
| Owner consent and handwritten ground truth | User attested owner consent for all ten candidates. Manual item/monetary annotations preceded OCR; seven remain partial, foreign controls or QR-pending. Independent verification found and corrected two PII-box defects after the run, so privacy ground truth is not a frozen pre-OCR baseline. |
| External corpus path | Private manifest, consent record, ground truth, raw OCR outputs and measurements exist outside Git. Raw paths are intentionally not recorded here. |
| Selected provider, endpoint, model version | [Pending: team selection and actual account approval]. |
| Spending limit / actual requests | [Pending: approved budget]; actual requests: 0. No charge is inferred from a nonexistent run. |
| Public-policy research | Separate [unapproved-candidate evidence memo](../spikes/s3-extraction/provider-retention.md); public terms do not verify account settings. |

The user delegated sample size; 100 is an experiment target, not a guarantee. Freeze the procedure after the 20-receipt pilot, then evaluate the remaining 80 without tuning. Report actual counts and any justified expansion or incomplete coverage. The supporting document's old 95%/90% thresholds are not adopted as a new acceptance policy.

## Separate exploratory observation

See [the three-example inspection](../spikes/s3-extraction/EXPLORATORY-NOTES.md). All three files decoded; two are cropped receipt sections, one shows a non-Argentine fiscal context, and none exposes an Argentine QR in the supplied frame. Existing masks do not establish redaction quality. Exact-decimal spot-checks exposed discount/rounding ambiguity, not a provider-accuracy result, fiscal-verification failure or qualifying sample. The user subsequently approved the paired M2b/M3 revision-2 contract below; that resolves the monetary specification, not the missing real measurements or runtime implementation.

## Required measurements

All numeric results below are unavailable, not zero. Report per approved provider and separately for calibration/held-out data when execution is authorized.

| Metric | Result | Missing evidence |
|---|---|---|
| Exact-match item-description accuracy | Not measured | Human ground truth and model outputs; counts/denominators. |
| Exact-match unit-price accuracy | Not measured | Ground-truth monetary units and outputs. |
| Exact-match quantity accuracy | Not measured | Ground truth and outputs. |
| Exact-match printed-line-total accuracy | Not measured | Printed line amounts preserved independently of aggregate multiplication. |
| Exact-match total accuracy | Not measured | Ground truth and outputs. |
| Exact-match discount-amount accuracy | Not measured | Annotated printed discounts and outputs. |
| Exact-match discount-scope accuracy | Not measured | Item/receipt scope truth and valid item references. |
| Exact-match discount-accounting accuracy | Not measured | Additional/already-included/informational/unknown classification truth. |
| Discount-aware reconciled total = total = QR amount pass rate | Not measured | Trusted receipt currency/scale, fiscal QR truth, printed line totals, discount classification and check outcomes. |
| Personal-region redaction false-negative rate | Not measured | Annotated regions and inspected review copies; a zero denominator is not 0% error. |
| Fiscal-data loss | Not measured | L1 fiscal-field annotations and post-redaction visibility. |
| Pre-LLM redaction feasibility | Not measured | Actual local masking, privacy/fiscal inspection and extraction evidence; assisted and automatic methods separated. |
| Manual-review rate | Not measured | Calibrated/frozen thresholds, routing outcomes and review-time observations. |
| Latency p50 / p95 | Not measured | Timed attempts, failures/retries and stated percentile convention. |
| Cost per receipt | Not measured | Actual provider/API usage, rates/date/currency and separate manual effort. |
| Provider image retention | Public-policy research only | Approved provider/account/API mode, actual settings and terms applicable to image inputs. |

## Contract and decision record

The user approved [Extractor revision 2](../spikes/s3-extraction/EXTRACTOR-CONTRACT.md), committed as the paired M2b/M3 unit `6272cc8` with independent structural verification and acknowledged native risk/readability review:

```text
{ items: [{description, ean?, quantity, unitPriceAtomic, lineTotalAtomic}], discounts: [{label, scope, itemIndex?, amountAtomic, accounting}], totalAtomic, confidence: 0..1, modelVersion, piiBoxes: [{x,y,w,h,kind}] }
```

- Chosen provider/model: **[Pending]**; the research shortlist is not a selection.
- Monetary contract: printed line totals, exact receipt-currency values and explicit discount accounting are specified in revision 2. The separately implemented [synthetic-only local checker](../spikes/s3-extraction/README.md) checks only that monetary projection; it is not a full extractor/privacy validator or empirical performance result.
- Automatic-accept and manual-review confidence thresholds: **[Pending]**, to propose from calibration and freeze before held-out evaluation.
- Whether measured quality and manual effort are acceptable at reasonable cost: **[Pending: user's decision from actual numbers]**.
- M2b exit: **not satisfied**. There is no measured reliability failure yet; the qualifying experiment has not run. M3 must not treat the report or the separate web-example inspection as successful provider/viability proof.

## Privacy boundary and next input

Images, personal extraction outputs, handwritten annotations, consent records and detailed per-receipt results stay outside the public repository. No raw-image upload, paid request, `.env` access, credential discovery or cloud retention period is authorized by this report. Q11 requires local EXIF handling and selective redaction; uncertain personal-data removal stays in manual review.

Open inputs: close the gap of seventeen qualifying, fully annotated entries from the current three complete visible item/monetary Argentine records to the 20-receipt pilot, through new eligible receipts or completion of eligible partial records; complete and freeze fiscal/privacy truth, then obtain 80 held-out receipts. Approved provider/account/mode, applicable retention and a spending limit remain required before any external request. The monetary gap has an authorized revision-2 specification and isolated synthetic checker; full schema/privacy validation, adapter implementation and final PII-coordinate conventions remain separate work. The local OCR authorization does not approve external processing or additional services.

## Local executable evidence (not real extraction measurements)

`checkAccounting(input, moneyContext, fiscalQrAmountAtomic)` returns only monetary `consistent` or code-only `review`, never ingestion acceptance. The spike has pinned development tools, no runtime dependency and no production consumer. The public-seam suite passes 231 invented checks, including all ten documented examples, malformed values, large integers, discount references/classification, cumulative deductions, immutability and sanitized diagnostics. Type checking passes separately. Independent dependency-risk verification passed in a fresh snapshot: offline frozen install with zero downloads, 231 passing tests, passing typecheck and 79 additional public-seam/structural assertions. The parent repeated those assertions and a native Node seam smoke test. These checks do not constitute a real-data benchmark.

These checker outcomes are not receipt-level deterministic-pass rates or extraction/redaction benchmarks. The separate raw-OCR calibration below does not change that: there is still no provider choice, structured Extractor output, redacted review copy or external request. Every required M2b measurement row above remains unavailable.

The checker is committed as `d6947c3`, separately from paired contract `6272cc8`. Candidate-specific native risk, resilience, readability and reliability reviews returned no findings; exact acknowledgement closed that review. The native reviewers inspected immutable patches rather than rerunning tests. No dependency vulnerability scan was run, so absence of vulnerabilities is not asserted. The authorized local specification/checker scope is complete; the real M2b experiment remains pending.

## Local Python OCR experiment (not real-corpus evidence)

The user approved an isolated [Python CPU worker](../spikes/s3-extraction/ocr-worker/README.md) using PaddleOCR 3.7.0, PaddleX 3.7.2, CPU PaddlePaddle 3.3.1, Pillow 13.0.0 and pinned PP-OCRv6 small detector/recognizer files. Windows/Python-3.12 hash-locked binary-wheel installation and all six immutable model files were verified outside Git. Recognition uses explicit local models and Python socket denial; that is not an OS/native-code network sandbox. No Fluence instance, remote upload or external extraction API was used.

A generated image containing exactly `TUKI 12345` passed a real CPU CLI smoke: one recognized region, unchanged input bytes, empty stderr, 66.25 seconds cold end-to-end including import/model initialization. This is neither steady-state latency nor accuracy on real receipts. The local CLI loads a model per process invocation; production pooling, Linux validation, OS egress/process isolation and capacity remain future verification. The final corrected-source suite passes 31 Python tests (also under optimized Python), AST syntax checks, and the unchanged checker's 231 tests/typecheck. A repeat synthetic CPU smoke passed in 11.25 seconds with existing caches; neither timing is a steady-state latency or capacity claim. Test-owned temporary directories now clean up on success and failure; 365 older directories remain after an authorized cleanup was denied, without a workaround. Independent verification passed with an offline 72-package installation, all six real model hashes, 45 initial assertions, initial 29-test normal/optimized runs and an exact synthetic CPU smoke in 15.828 seconds. It found one mixed-separator UNC guard defect; a bounded correction plus two focused regressions and eight public-seam checks in both modes confirmed rejection before any remote filesystem probe. The parent repeated those checks and matched the corrected source hash. This does not prove native-code/OS isolation or real receipt quality. Eligible real-corpus count and all empirical metric rows above remain unchanged.

### Partial private calibration run

After explicit owner-consent and provenance confirmation, handwritten item/monetary annotations were recorded privately before OCR. The worker processed all ten candidates locally with unchanged input hashes, successful JSON output and empty stderr: 150.185 seconds total, p50 15.345 seconds and nearest-rank p95 18.132 seconds. Normalized concatenated-text substring matching found 10/16 description targets; per-region digit equality/suffix matching found 43/47 amount targets. These are reproducible raw-text diagnostics, not exact structured-field accuracy. The mean recognition-region score was 0.974191, which is model confidence rather than calibrated correctness.

Independent visual verification found one out-of-bounds and two misplaced PII boxes in two annotations. Those boxes were corrected manually after the run, invalidating the initial 7/8 overlap result as pre-OCR evidence. The post-hoc overlap is deliberately not presented as redaction evidence: axis-aligned OCR-polygon overlap neither classifies PII nor produces a masked review image, and the corrected privacy truth was not frozen before inference.

These numbers are deliberately separate from the required measurement table. The set has no held-out partition, contains four foreign-jurisdiction controls, two cropped/incomplete Argentine receipts and one Argentine receipt with fiscal-QR truth still pending; only three entries currently have complete visible item/monetary Argentine annotations. Raw images, paths, annotations, OCR text and per-receipt outcomes remain private. No external service, Fluence host, credential, `.env` file or provider account was used. This run supports iteration on the local OCR seam only and does not establish M2b viability, extraction accuracy, redaction quality or production capacity.

The evidence unit is committed as `ef40329`. Independent private-artifact verification passed after the bounded PII-annotation correction and withdrawal of the invalid metric. Candidate-specific native risk/readability/reliability review returned no findings and its exact acknowledgement burned authority. That review inspected immutable public documentation only; it did not re-run OCR or inspect private artifacts.
