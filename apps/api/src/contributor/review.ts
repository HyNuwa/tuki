import { parseMoney, parseQuantity, type Draft, type Review } from "@tuki/domain";

/** Validate and rebuild a review; evidence references always come from the draft. */
export function validateReview(input: unknown, draft: Draft): Review | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  const text = (v: unknown): v is string => typeof v === "string" && v.length <= 4096;
  if (![value.merchant, value.date, value.voucher, value.total].every(text) || !Array.isArray(value.items) || value.items.length > 500 || !Array.isArray(value.discounts) || value.discounts.length > 100) return null;
  const money = (v: string) => v === "" || parseMoney(v) !== null;
  if (!money(value.total as string)) return null;
  const items: Review["items"] = [];
  for (const row of value.items) {
    if (!row || ![row.id, row.description, row.quantity, row.unitPrice, row.lineTotal].every(text) || (row.unit !== undefined && !text(row.unit))) return null;
    if (!row.id || items.some(item => item.id === row.id) || !money(row.unitPrice) || !money(row.lineTotal) || (row.quantity !== "" && parseQuantity(row.quantity) === null)) return null;
    items.push({ id: row.id, description: row.description, quantity: row.quantity, unit: row.unit ?? "", unitPrice: row.unitPrice, lineTotal: row.lineTotal,
      sourceRegionIds: [...(draft.items.find(item => item.id === row.id)?.sourceRegionIds ?? [])] });
  }
  const discounts: Review["discounts"] = [];
  for (const row of value.discounts) {
    if (!row || !text(row.description) || !text(row.amount) || !money(row.amount)) return null;
    discounts.push({ description: row.description, amount: row.amount });
  }
  return { merchant: value.merchant as string, date: value.date as string, voucher: value.voucher as string, total: value.total as string, items, discounts };
}
