export * from "./review.js";
import { parseMoney, parseQuantity, type Review, type Provenance } from "./review.js";

export const stateLabels = {
  uploaded: "Cargado", processing: "Procesando", extraction_ready: "Extracción disponible",
  needs_review: "Requiere revisión", reviewed: "Revisión completada",
  fiscal_pending: "Validación fiscal pendiente", processing_error: "Error de procesamiento",
} as const;
export type ContributionState = keyof typeof stateLabels;
export const isState = (value: string): value is ContributionState => Object.hasOwn(stateLabels, value);

export function fieldProvenance(before: string | undefined, now: string): Provenance {
  if (before === undefined) return now.trim() ? "corrected" : "missing";
  return before.trim() === now.trim() ? (now.trim() ? "extracted" : "missing") : "corrected";
}

export type ArithmeticWarning = { code: "line_mismatch"; itemId: string } | { code: "total_mismatch" | "discounts_unresolved" };
/** Compare exact rational quantities, never round or repair printed amounts. */
export function arithmeticWarnings(review: Review): ArithmeticWarning[] {
  const warnings: ArithmeticWarning[] = [];
  for (const item of review.items) {
    const quantity = parseQuantity(item.quantity);
    const unit = parseMoney(item.unitPrice), line = parseMoney(item.lineTotal);
    if (quantity === null || unit === null || line === null) continue;
    const [whole = "0", fraction = ""] = quantity.split(".");
    if (BigInt(whole + fraction) * BigInt(unit) !== BigInt(line) * 10n ** BigInt(fraction.length))
      warnings.push({ code: "line_mismatch", itemId: item.id });
  }
  const total = parseMoney(review.total);
  const lines = review.items.map(item => parseMoney(item.lineTotal));
  if (total !== null && lines.length > 0 && lines.every(line => line !== null) &&
    lines.reduce((sum, line) => sum + BigInt(line!), 0n) !== BigInt(total)) warnings.push({ code: "total_mismatch" });
  if (review.discounts.length) warnings.push({ code: "discounts_unresolved" });
  return warnings;
}

export function reviewProvenance(initial: Review, current: Review): Record<string, Provenance> {
  const result: Record<string, Provenance> = {};
  for (const field of ["merchant", "date", "voucher", "total"] as const)
    result[field] = fieldProvenance(initial[field], current[field]);
  for (const item of current.items) {
    const original = initial.items.find(row => row.id === item.id);
    for (const field of ["description", "quantity", "unit", "unitPrice", "lineTotal"] as const)
      result[`items.${item.id}.${field}`] = fieldProvenance(original?.[field], item[field] ?? "");
  }
  for (const [index, discount] of current.discounts.entries())
    for (const field of ["description", "amount"] as const)
      result[`discounts.${index}.${field}`] = fieldProvenance(initial.discounts[index]?.[field], discount[field]);
  return result;
}
