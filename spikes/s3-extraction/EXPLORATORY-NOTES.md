# Three web examples: qualitative findings only

Date: 2026-11-15. Scope: the user explicitly approved inspecting three supplied web examples in this assistant session, without standalone extraction API requests. These observations are **not an extractor benchmark, consent verification, ground truth or M2b viability evidence**. Eligible M2b corpus remains zero.

## Input coverage

| Opaque example | Format / dimensions | Observed coverage | Limitation |
|---|---|---|---|
| A | JPEG, 2296 x 4080 | Cropped item section with fractional weights, unit prices, displayed line amounts and subordinate package/code rows. | Issuer header, final total and fiscal QR are outside the supplied frame; whole-receipt reconciliation is unavailable. |
| B | WebP, 433 x 850 | EUR/Spanish-issuer retail context, item markdown, zero-value promotion rows, tax summary and split payment. | Not an Argentine fiscal example; no Argentine QR is visible. Small text and adjustments require careful annotation. |
| C | PNG, 720 x 1279 | Cropped grocery receipt with line/basket promotions, subtotal, discounts, total and existing colored masks near payment/loyalty regions. | Issuer header and fiscal QR are not visible. Existing masks have unknown provenance/coverage and are not a successful redaction test. |

All three files decoded for visual inspection and have different file hashes. This does not establish three distinct physical purchases; overlapping crops of one receipt must not become independent sample rows. No Argentine fiscal QR was visible in the supplied frames; no decoder was run and nothing is inferred about unseen portions of the original receipts.

## Arithmetic spot-checks

Manual reading plus exact-decimal calculations reproduced three visible relationships: a line markdown leading to a displayed total, two tenders summing to a total, and a subtotal minus basket discounts equaling a total. These are isolated qualitative sanity checks, not item-extraction accuracy or the required item-sum/total/QR pass rate. Full line-by-line handwritten truth is absent.

One weighted line differs by 0.01 displayed currency units when total weight is multiplied by unit price and rounded once. Summing individually rounded subordinate package amounts reproduces its displayed amount. That is a plausible explanation for this one observation, not proof of a universal retailer rounding rule. Raw transcriptions and source mapping remain private; none are copied here.

## Implications and open spec question

- Preserve fractional quantities; an integer-only quantity assumption would lose visible information.
- Distinguish item/basket discounts, zero-value promotional rows, subtotal summaries and payment tenders. Counting a tender as an item or subtracting the same discount twice would create false reconciliation.
- Preserve fiscal issuer fields rather than treating the whole header as buyer data. No personal-data absence or redaction false-negative rate is established by these three rendered examples or their pre-existing masks.
- **[Pending]** M2b's fixed output shape has no explicit line-total or discount/adjustment field; quantity precision, gross/net unit-price semantics and the stage of rounding are not specified. Resolve this jointly for M2b/M3 before implementing an automatic reconciliation policy. No fields, monetary conventions or production contract were changed by this inspection.

## Evidence boundary

Only aggregate observations are committed. Original files are unchanged and remain outside the repo; a private manifest records source mapping, dimensions, hashes and the worked arithmetic. No `.env`, credentials, provider account, paid call or additional web service was used. Visual inspection happened in the current assistant session, not an on-device OCR engine; no standalone provider comparison was run.

The 100-receipt target, 20/80 split, real-owner consent requirement and pending provider/account/budget approval remain unchanged. This exploration does not satisfy M2b's exit or unblock M3's provider prerequisite.

## Subsequent resolution — 2026-11-15

After this inspection, the user approved a paired M2b/M3 extension. [Revision 2](EXTRACTOR-CONTRACT.md) now preserves printed line totals and explicitly distinguishes additional, already-included, informational and unknown discount effects. The earlier pending monetary-shape observation above is historical; no new inspection, provider benchmark, executable implementation or eligibility of these web images follows from that specification change.
