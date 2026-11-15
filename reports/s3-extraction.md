# S3 extraction and selective-redaction viability

**Verdict: INCONCLUSIVE / NO QUALIFYING EXPERIMENT RUN.** This is not a completed M2b exit. Three user-approved web examples were qualitatively inspected in this assistant session, without standalone extraction API requests; none qualify for the consented-team corpus. No provider has been selected or benchmarked.

Date: 2026-11-15. Coordinator: Maximiliano, under the user's explicit authorization. Scope: [M2b](../odd/specs/m2-s3-extraction-spike.md). Procedure: [S3 protocol](../spikes/s3-extraction/PROTOCOL.md).

## Corpus and execution

| Item | Target / current evidence |
|---|---|
| Distinct consented team receipts | Target 100; supplied/annotated/evaluated: 0. |
| Calibration / held-out split | Target 20 / 80; actual 0 / 0. |
| Stores, printers and quality strata | [Pending: private corpus and coverage inventory]. |
| Owner consent and handwritten ground truth | [Pending: private records; no third-party receipts]. |
| External corpus path | A private directory with three web examples was supplied for exploratory-only inspection; an eligible consented-team corpus via `S3_DATASET_DIR` remains pending. |
| Selected provider, endpoint, model version | [Pending: team selection and actual account approval]. |
| Spending limit / actual requests | [Pending: approved budget]; actual requests: 0. No charge is inferred from a nonexistent run. |
| Public-policy research | Separate [unapproved-candidate evidence memo](../spikes/s3-extraction/provider-retention.md); public terms do not verify account settings. |

The user delegated sample size; 100 is an experiment target, not a guarantee. Freeze the procedure after the 20-receipt pilot, then evaluate the remaining 80 without tuning. Report actual counts and any justified expansion or incomplete coverage. The supporting document's old 95%/90% thresholds are not adopted as a new acceptance policy.

## Separate exploratory observation

See [the three-example inspection](../spikes/s3-extraction/EXPLORATORY-NOTES.md). All three files decoded; two are cropped receipt sections, one shows a non-Argentine fiscal context, and none exposes an Argentine QR in the supplied frame. Existing masks do not establish redaction quality. Exact-decimal spot-checks found that discounts, split payment and per-package versus aggregate rounding need explicit treatment. This is not a provider-accuracy result, fiscal-verification failure or qualifying sample. **[Pending]** Resolve the monetary representation gap in M2b/M3 before implementing a reconciliation convention; the output contract below is unchanged.

## Required measurements

All numeric results below are unavailable, not zero. Report per approved provider and separately for calibration/held-out data when execution is authorized.

| Metric | Result | Missing evidence |
|---|---|---|
| Exact-match item-description accuracy | Not measured | Human ground truth and model outputs; counts/denominators. |
| Exact-match unit-price accuracy | Not measured | Ground-truth monetary units and outputs. |
| Exact-match quantity accuracy | Not measured | Ground truth and outputs. |
| Exact-match total accuracy | Not measured | Ground truth and outputs. |
| Item sum = total = QR amount pass rate | Not measured | Fiscal QR truth, item totals and deterministic-check outcomes. |
| Personal-region redaction false-negative rate | Not measured | Annotated regions and inspected review copies; a zero denominator is not 0% error. |
| Fiscal-data loss | Not measured | L1 fiscal-field annotations and post-redaction visibility. |
| Pre-LLM redaction feasibility | Not measured | Actual local masking, privacy/fiscal inspection and extraction evidence; assisted and automatic methods separated. |
| Manual-review rate | Not measured | Calibrated/frozen thresholds, routing outcomes and review-time observations. |
| Latency p50 / p95 | Not measured | Timed attempts, failures/retries and stated percentile convention. |
| Cost per receipt | Not measured | Actual provider/API usage, rates/date/currency and separate manual effort. |
| Provider image retention | Public-policy research only | Approved provider/account/API mode, actual settings and terms applicable to image inputs. |

## Contract and decision record

The M3-facing output contract is unchanged:

```text
{ items: [{description, ean?, quantity, unitPriceAtomic}], totalAtomic, confidence: 0..1, modelVersion, piiBoxes: [{x,y,w,h,kind}] }
```

- Chosen provider/model: **[Pending]**; the research shortlist is not a selection.
- Automatic-accept and manual-review confidence thresholds: **[Pending]**, to propose from calibration and freeze before held-out evaluation.
- Whether measured quality and manual effort are acceptable at reasonable cost: **[Pending: user's decision from actual numbers]**.
- M2b exit: **not satisfied**. There is no measured reliability failure yet; the qualifying experiment has not run. M3 must not treat the report or the separate web-example inspection as successful provider/viability proof.

## Privacy boundary and next input

Images, personal extraction outputs, handwritten annotations, consent records and detailed per-receipt results stay outside the public repository. No raw-image upload, paid request, `.env` access, credential discovery or cloud retention period is authorized by this report. Q11 requires local EXIF handling and selective redaction; uncertain personal-data removal stays in manual review.

Open inputs: eligible consented-team receipts and handwritten truth; a decision on the discount/rounding representation gap; approved provider/account/mode, applicable retention and a spending limit before any external request. The separate three-web-example inspection is complete; it does not approve broader image processing or additional services.
