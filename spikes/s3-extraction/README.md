# Synthetic monetary checker

Experimental local checks for [Extractor revision 2](EXTRACTOR-CONTRACT.md).
This is **not** an extractor, full schema/privacy validator, M3 integration or M2b viability result.
Use invented projections only; do not supply real receipts or personal data.

## Run

Use Node `24.14.0` and pnpm `10.32.1`:

```sh
pnpm --dir spikes/s3-extraction install --frozen-lockfile --ignore-scripts
pnpm --dir spikes/s3-extraction test
pnpm --dir spikes/s3-extraction typecheck
```

The private package has its own lockfile and strict TypeScript configuration.
Its only direct dependencies are development tools: TypeScript `7.0.2`, Vitest `5.1.0`
and `@types/node` `24.19.2`. Run both checks: test execution does not replace type checking.
There are no runtime dependencies, provider calls, environment-file loaders or root workspace setup.

## Public seam

```typescript
import { checkAccounting } from "./src/check-accounting.ts";

const result = checkAccounting(
  {
    items: [{ quantity: "0.666", unitPriceAtomic: "1001", lineTotalAtomic: "666" }],
    discounts: [],
    totalAtomic: "666",
  },
  { currency: "ARS", scale: 2 },
  "666",
);
// { status: "consistent", reconciledTotalAtomic: "666" }
```

All three arguments are `unknown`. The caller must supply trusted currency/scale context
and a fiscal QR amount already converted exactly to the same atomic scale.
Context needs a non-whitespace currency string and a nonnegative safe-integer numeric scale.
The checker validates that structure, not the provenance or correctness of the context/QR conversion.

Only quantities, printed unit/line amounts, discounts and the extracted total are checked.
Money is canonical nonnegative integer-string `BigInt`; quantities are positive canonical decimal strings.
Printed line totals are authoritative: quantity times price is never substituted, rounded or used to balance them.
Only `deduct_from_items` subtracts. Item references are zero-based safe integers; receipt discounts
must omit `itemIndex`, even when its value would be `undefined`. Included/informational amounts
are not deducted again. Unknown effects require review even at zero; no classification is inferred.
Item and receipt deductions cannot make results negative. Reconciled, extracted and QR totals must match exactly.

## Results and limits

`consistent` carries only a decimal-string `reconciledTotalAtomic`.
`review` carries `issues`, containing the first detected machine-readable code, never input or exception text:

| Codes | Meaning |
|---|---|
| `invalid_context`, `invalid_qr_amount` | Missing or malformed monetary interpretation inputs. |
| `invalid_input`, `invalid_item`, `invalid_discount` | Required arrays/objects absent or malformed. |
| `invalid_money`, `invalid_quantity` | Required values violate their exact canonical representation. |
| `invalid_discount_scope`, `invalid_item_reference`, `invalid_discount_accounting` | Discount classification/reference is invalid. |
| `unknown_discount_accounting` | Monetary effect is explicitly unresolved. |
| `negative_item_total`, `negative_receipt_total`, `total_mismatch` | Exact reconciliation fails. |
| `malformed_input` | An object cannot be read safely, for example a throwing getter/proxy. |

The checker does not mutate inputs and never returns `accepted`.
It does not validate descriptions, EANs, labels, confidence, model version, PII boxes or receipt completeness;
empty arrays alone do not establish a valid receipt. It cannot establish correct row classification,
authenticity, consent, privacy, deduplication, extraction accuracy or safe acceptance.
Raw QR decoding, conversion, surcharges/returns, images and production ingestion remain out of scope.
See the [experiment report](../../reports/s3-extraction.md) for the still-unmeasured real-data work.
