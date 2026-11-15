# S3 extraction and selective-redaction viability

**Verdict: INCONCLUSIVE / NOT RUN.** This is the experiment's preparation record, not a completed M2b exit. No real receipt has been inspected, no extraction request has been sent, and no provider has been selected.

Date: 2026-11-15. Coordinator: Maximiliano, under the user's explicit authorization. Scope: [M2b](../odd/specs/m2-s3-extraction-spike.md). Procedure: [S3 protocol](../spikes/s3-extraction/PROTOCOL.md).

## Corpus and execution

| Item | Target / current evidence |
|---|---|
| Distinct consented team receipts | Target 100; supplied/annotated/evaluated: 0. |
| Calibration / held-out split | Target 20 / 80; actual 0 / 0. |
| Stores, printers and quality strata | [Pending: private corpus and coverage inventory]. |
| Owner consent and handwritten ground truth | [Pending: private records; no third-party receipts]. |
| External corpus path | [Pending: user supplies `S3_DATASET_DIR` outside the repository]. |
| Selected provider, endpoint, model version | [Pending: team selection and actual account approval]. |
| Spending limit / actual requests | [Pending: approved budget]; actual requests: 0. No charge is inferred from a nonexistent run. |
| Public-policy research | Separate [unapproved-candidate evidence memo](../spikes/s3-extraction/provider-retention.md); public terms do not verify account settings. |

The user delegated sample size; 100 is an experiment target, not a guarantee. Freeze the procedure after the 20-receipt pilot, then evaluate the remaining 80 without tuning. Report actual counts and any justified expansion or incomplete coverage. The supporting document's old 95%/90% thresholds are not adopted as a new acceptance policy.

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
- M2b exit: **not satisfied**. There is no measured reliability failure yet; the experiment has not run. M3 must not treat this skeleton as successful provider/viability proof.

## Privacy boundary and next input

Images, personal extraction outputs, handwritten annotations, consent records and detailed per-receipt results stay outside the public repository. No raw-image upload, paid request, `.env` access, credential discovery or cloud retention period is authorized by this report. Q11 requires local EXIF handling and selective redaction; uncertain personal-data removal stays in manual review.

Next input: the private corpus directory containing consented team receipts. Provider/account/mode approval, retention verification and an explicit spending limit are separate prerequisites before any external request. Until then, only public-document research and local preparation may proceed.
