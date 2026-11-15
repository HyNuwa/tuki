# Extractor contract, revision 2

Normative for [M2b section 4](../../odd/specs/m2-s3-extraction-spike.md) and [M3](../../odd/specs/m3-ingestion.md). The user approved the paired line-total/discount extension on 2026-11-15. This is a specification, not an implemented adapter, runtime validator or successful S3 experiment. It changes neither M1 nor on-chain USDC accounting.

## Output shape

```typescript
type Atomic = string;
type Quantity = string;
type DiscountAccounting =
  | "deduct_from_items"
  | "already_in_items"
  | "informational"
  | "unknown";

type Discount = {
  label: string;
  amountAtomic: Atomic;
  accounting: DiscountAccounting;
} & (
  | { scope: "item"; itemIndex: number }
  | { scope: "receipt" }
);

type ExtractedItem = {
  description: string;
  ean?: string;
  quantity: Quantity;
  unitPriceAtomic: Atomic;
  lineTotalAtomic: Atomic;
};

type ExtractedReceipt = {
  items: ExtractedItem[];
  discounts: Discount[];
  totalAtomic: Atomic;
  confidence: number;
  modelVersion: string;
  piiBoxes: Array<{ x: number; y: number; w: number; h: number; kind: string }>;
};
```

All old field names remain. `lineTotalAtomic` and root `discounts` are required in revision 2; a legacy object lacking them is not silently upgraded. No tracked executable consumer exists at the change baseline. M3 implementations/fakes must adopt this same revision; no production compatibility is claimed.

## Exact values and interpretation context

- `Atomic` is a canonical nonnegative integer decimal string: `0` or a nonzero digit followed by digits. No signs, separators, fraction, exponent or binary floating-point monetary calculation. Parse it with exact integer arithmetic.
- `Quantity` is an exact positive decimal string using a dot, no sign/exponent or redundant leading zeros. The producer emits trailing fractional zeros removed without rounding, so `1.500` becomes `1.5`; zero is invalid. Ground truth uses the same canonical normalization before exact-match comparison.
- A trusted extraction context supplies the receipt currency and a nonnegative integer decimal scale before the call. This is not a new output field. Every atomic amount, including the fiscal QR amount, uses that currency/scale. The scale must preserve the printed monetary precision, including unit prices; do not assume cents or USDC's six decimals. Missing/ambiguous context or precision exceeding it requires review, not truncation, guessed conversion or FX.
- Only currency/scale interpretation context is supplied to the extractor, not handwritten expected line amounts or a target total to balance against. S3 annotations record the same context. Decimal QR amounts must be converted exactly before comparison.
- `unitPriceAtomic`, `quantity` and `lineTotalAtomic` preserve their respective printed values. `lineTotalAtomic` is the merchandise-line amount as printed, whether gross or already discounted. Do not overwrite the printed unit price to make multiplication fit, or replace a printed line total with rounded aggregate multiplication. Package-level rounding can legitimately differ.
- Confidence remains a number in `[0,1]`; model version and PII fields retain their existing purposes. This monetary revision does not resolve the separately pending PII-coordinate conventions or prove redaction quality.

## Discounts and row classification

| `accounting` | Meaning | Reconciliation effect |
|---|---|---|
| `deduct_from_items` | A visible discount is not yet reflected in the emitted printed line amounts. | Subtract its nonnegative amount exactly once. |
| `already_in_items` | Its effect is already reflected in one or more emitted printed line amounts. | Do not subtract it again. |
| `informational` | A displayed summary/repetition has no additional monetary effect, or describes a later benefit rather than a receipt deduction. | No subtraction; require source evidence for the classification. |
| `unknown` | The scope is known but inclusion/effect cannot be established. | Review; never treat uncertainty as zero effect or automatic acceptance. |

Item scope requires an integer, zero-based `itemIndex` resolving into `items` in printed merchandise order. Receipt scope must omit `itemIndex`. A missing/ambiguous scope or unreadable amount is not repaired with a fabricated index, zero amount or valid-looking discount; it requires validation failure/review.

A repeated total-discount summary may be recorded as `informational`, not a second deduction of its constituent discounts. Scope, inclusion and summary classification must be supported by the source, not selected merely because a total balances. `discounts: []` means no extracted discount; it is not proof that the image contains none. Never invent a balancing discount or rounding entry.

Payments/tenders, subtotal/tax summaries and zero-value promotional labels are not merchandise. Retain genuine zero-priced merchandise with positive quantity and zero printed price/line total. Surcharges and returns are not newly supported: an unresolved effect requires review. A post-purchase bank/wallet rebate never reduces the fiscal receipt total; if recorded as context, it is informational only.

## Deterministic monetary check

```text
reconciledTotal = sum(items.lineTotalAtomic)
  - sum(discounts.amountAtomic where accounting == "deduct_from_items")
reconciledTotal == totalAtomic == fiscalQrAmountAtomic
```

All comparisons are exact at the trusted scale, with no epsilon. Item deductions must not make their referenced line negative; all deductions must not make the receipt negative. An unknown effect, invalid reference, missing line/context/QR, unsupported adjustment or inconsistent totals cannot lead to automatic acceptance. M3 retains `total_mismatch`/review routing for mismatches; unresolved interpretation goes to review. Monetary consistency alone does not override consent, privacy, authenticity, dedupe, quotas or other acceptance checks.

Quantity times unit price is a diagnostic, not the unconditional reconciliation equation. Split tenders settle the total but are absent from this equation. A provider could fabricate internally consistent values, so S3 must still compare lines and discounts against independent handwritten truth.

## Synthetic accounting checks

These are invented monetary projections, not complete API payloads, real receipt data or provider results. Context for every row is synthetic `ARS`, scale `2`. Item tuples are `[quantity, unitPriceAtomic, lineTotalAtomic]`; discount tuples are `[scope, itemIndex, amountAtomic, accounting]` (`null` denotes omitted receipt-level index). Labels and nonmonetary fields are irrelevant to these calculations and are not represented in this projection.

| ID | Items | Discounts | totalAtomic | fiscalQrAmountAtomic | Expected |
|---|---|---|---|---|---|
| gross | [["1","1000","1000"],["1","500","500"]] | [["item",0,"100","deduct_from_items"],["receipt",null,"50","deduct_from_items"],["receipt",null,"150","informational"]] | 1350 | 1350 | consistent |
| net | [["1","1000","900"],["1","500","500"]] | [["item",0,"100","already_in_items"],["receipt",null,"50","deduct_from_items"]] | 1350 | 1350 | consistent |
| mixed | [["1","1000","1000"],["1","500","450"]] | [["item",0,"100","deduct_from_items"],["item",1,"50","already_in_items"],["receipt",null,"50","deduct_from_items"]] | 1300 | 1300 | consistent |
| package-rounding | [["0.666","1001","666"]] | [] | 666 | 666 | consistent |
| zero-priced-item | [["1","0","0"],["1","100","100"]] | [] | 100 | 100 | consistent |
| qr-mismatch | [["1","1000","1000"],["1","500","500"]] | [["receipt",null,"150","deduct_from_items"]] | 1350 | 1351 | review |
| unknown-effect | [["1","1000","1000"],["1","500","500"]] | [["item",0,"100","unknown"]] | 1400 | 1400 | review |
| bad-reference | [["1","1000","1000"]] | [["item",2,"100","deduct_from_items"]] | 900 | 900 | review |
| double-deduction | [["1","1000","900"],["1","500","500"]] | [["item",0,"100","already_in_items"],["receipt",null,"100","deduct_from_items"]] | 1400 | 1400 | review |
| negative-receipt | [["1","100","100"]] | [["receipt",null,"200","deduct_from_items"]] | 0 | 0 | review |

For package-rounding, two packages of quantity `0.333` at unit price `1001` each round to `333` atomic units, totaling `666`; rounding `0.666 * 1001` once gives `667`. Preserve the printed `666`; do not fabricate a `-1` adjustment. This illustrates why the check uses printed line totals, not a universal retailer rounding rule.

Split-tender control: payments of `800` and `550` settle a `1350` total without becoming extra items. Removing the trusted money context or fiscal QR from any otherwise consistent example requires review. None of these checks proves real extraction accuracy or completes M2b.
