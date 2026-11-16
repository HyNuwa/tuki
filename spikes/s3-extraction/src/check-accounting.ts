type AccountingIssue =
  | "invalid_context" | "invalid_qr_amount" | "invalid_input" | "invalid_money"
  | "invalid_item" | "invalid_quantity" | "invalid_discount" | "invalid_item_reference"
  | "invalid_discount_scope" | "unknown_discount_accounting" | "invalid_discount_accounting"
  | "negative_item_total" | "negative_receipt_total" | "total_mismatch" | "malformed_input";

type AccountingResult =
  | { status: "consistent"; reconciledTotalAtomic: string }
  | { status: "review"; issues: readonly AccountingIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoney(value: unknown): value is string {
  // Compare the entire match: JavaScript's `$` can also precede a final newline.
  return typeof value === "string" && /^(?:0|[1-9][0-9]*)$/u.exec(value)?.[0] === value;
}

function checkProjection(
  input: unknown,
  moneyContext: unknown,
  fiscalQrAmountAtomic: unknown,
): AccountingResult {
  if (!isRecord(moneyContext) || typeof moneyContext.currency !== "string" ||
    moneyContext.currency.trim().length === 0 || typeof moneyContext.scale !== "number" ||
    !Number.isSafeInteger(moneyContext.scale) || moneyContext.scale < 0) {
    return { status: "review", issues: ["invalid_context"] };
  }
  if (!isMoney(fiscalQrAmountAtomic)) return { status: "review", issues: ["invalid_qr_amount"] };
  if (!isRecord(input) || !Array.isArray(input.items) || !Array.isArray(input.discounts)) {
    return { status: "review", issues: ["invalid_input"] };
  }
  if (!isMoney(input.totalAtomic)) return { status: "review", issues: ["invalid_money"] };
  let total = 0n;
  const itemBalances: bigint[] = [];
  for (const item of input.items) {
    if (!isRecord(item)) {
      return { status: "review", issues: ["invalid_item"] };
    }
    if (typeof item.quantity !== "string" || item.quantity === "0" ||
      /^(?:0|[1-9][0-9]*)(?:\.[0-9]*[1-9])?$/u.exec(item.quantity)?.[0] !== item.quantity) {
      return { status: "review", issues: ["invalid_quantity"] };
    }
    if (!isMoney(item.lineTotalAtomic) || !isMoney(item.unitPriceAtomic)) {
      return { status: "review", issues: ["invalid_money"] };
    }
    total += BigInt(item.lineTotalAtomic);
    itemBalances.push(BigInt(item.lineTotalAtomic));
  }
  for (const discount of input.discounts) {
    if (!isRecord(discount)) return { status: "review", issues: ["invalid_discount"] };
    if (!isMoney(discount.amountAtomic)) return { status: "review", issues: ["invalid_money"] };
    let itemIndex: number | undefined;
    if (discount.scope === "item") {
      if (typeof discount.itemIndex !== "number" || !Number.isSafeInteger(discount.itemIndex) ||
        discount.itemIndex < 0 || discount.itemIndex >= input.items.length) {
        return { status: "review", issues: ["invalid_item_reference"] };
      }
      itemIndex = discount.itemIndex;
    } else if (discount.scope === "receipt") {
      if ("itemIndex" in discount) return { status: "review", issues: ["invalid_item_reference"] };
    } else return { status: "review", issues: ["invalid_discount_scope"] };
    if (discount.accounting === "unknown") return { status: "review", issues: ["unknown_discount_accounting"] };
    if (discount.accounting !== "deduct_from_items" && discount.accounting !== "already_in_items" &&
      discount.accounting !== "informational") {
      return { status: "review", issues: ["invalid_discount_accounting"] };
    }
    if (discount.accounting === "deduct_from_items") {
      const amount = BigInt(discount.amountAtomic);
      if (itemIndex !== undefined) {
        const remaining = itemBalances[itemIndex];
        if (remaining === undefined) return { status: "review", issues: ["invalid_item_reference"] };
        if (amount > remaining) return { status: "review", issues: ["negative_item_total"] };
        itemBalances[itemIndex] = remaining - amount;
      }
      total -= amount;
    }
  }
  if (total < 0n) return { status: "review", issues: ["negative_receipt_total"] };
  if (total.toString() !== input.totalAtomic || input.totalAtomic !== fiscalQrAmountAtomic) {
    return { status: "review", issues: ["total_mismatch"] };
  }
  return { status: "consistent", reconciledTotalAtomic: total.toString() };
}

/** Synthetic monetary consistency only; this is not ingestion acceptance. */
export function checkAccounting(
  input: unknown,
  moneyContext: unknown,
  fiscalQrAmountAtomic: unknown,
): AccountingResult {
  try {
    return checkProjection(input, moneyContext, fiscalQrAmountAtomic);
  } catch {
    // Unknown values can include throwing getters/proxies. Never echo their data or errors.
    return { status: "review", issues: ["malformed_input"] };
  }
}
