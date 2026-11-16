export type DraftItem = {
  id: string;
  description: string;
  quantity: string | null;
  unitPriceAtomic: string | null;
  lineTotalAtomic: string | null;
  sourceRegionIds: string[];
  unit?: string | null;
};
export type Draft = {
  schemaVersion: string;
  parserVersion: string;
  status: "needs_review";
  fiscalStatus: "pending";
  commercialEligible: false;
  currency: "ARS";
  scale: 2;
  items: DraftItem[];
  totalAtomic: string | null;
  unresolvedLines: { text: string; sourceRegionIds: string[] }[];
  issues: string[];
  merchant?: string | null;
  date?: string | null;
  voucher?: string | null;
  discounts?: { description: string; amountAtomic: string | null }[];
};
export type EditorItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  sourceRegionIds: string[];
  unit?: string;
};
export type Review = {
  items: EditorItem[]; total: string;
  merchant: string; date: string; voucher: string;
  discounts: { description: string; amount: string }[];
};
export type ItemField = "description" | "quantity" | "unitPrice" | "lineTotal" | "unit";
export type Region = {
  id: string;
  text: string;
  score: number;
  polygon: [number, number][];
};
export type Extraction = {
  imageDataUrl: string;
  elapsedMs: number;
  draft: Draft;
  ocr: {
    engine: string;
    image: { width: number; height: number };
    regions: Region[];
  };
};

export function moneyForEditor(atomic: string | null): string {
  if (atomic === null) return "";
  const value = atomic.padStart(3, "0");
  return `${value.slice(0, -2)},${value.slice(-2)}`;
}

export function parseMoney(value: string): string | null {
  const text = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text)) return null;
  const [units, decimal = ""] = text.replaceAll(".", "").split(",");
  return BigInt(units + decimal.padEnd(2, "0")).toString();
}

export function parseQuantity(value: string): string | null {
  const text = value.trim().replace(",", ".");
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text) || /^0(?:\.0+)?$/.test(text))
    return null;
  return text;
}

export function createReview(draft: Draft): Review {
  return {
    merchant: draft.merchant ?? "", date: draft.date ?? "", voucher: draft.voucher ?? "",
    discounts: (draft.discounts ?? []).map(d => ({ description: d.description, amount: moneyForEditor(d.amountAtomic) })),
    total: moneyForEditor(draft.totalAtomic),
    items: draft.items.map((item) => ({
      id: item.id,
      description: item.description,
      unit: item.unit ?? "",
      quantity: item.quantity?.replace(".", ",") ?? "",
      unitPrice: moneyForEditor(item.unitPriceAtomic),
      lineTotal: moneyForEditor(item.lineTotalAtomic),
      sourceRegionIds: [...item.sourceRegionIds],
    })),
  };
}

export function updateItem(
  review: Review,
  id: string,
  field: ItemField,
  value: string,
): Review {
  return {
    ...review,
    items: review.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    ),
  };
}

export function reviewSnapshot(review: Review) {
  return {
    schemaVersion: "tuki-demo-review/1",
    status: "needs_review" as const,
    fiscalStatus: "pending" as const,
    commercialEligible: false as const,
    currency: "ARS",
    scale: 2,
    totalAtomic: parseMoney(review.total),
    items: review.items.map((item) => ({
      id: item.id,
      description: item.description.trim(),
      quantity: parseQuantity(item.quantity),
      unitPriceAtomic: parseMoney(item.unitPrice),
      lineTotalAtomic: parseMoney(item.lineTotal),
      sourceRegionIds: [...item.sourceRegionIds],
    })),
  };
}

export type Provenance = "extracted" | "corrected" | "missing";

/**
 * Where a visible value comes from, comparing the editor state with the
 * review created from the parser draft. Clearing an extracted value counts as
 * a manual correction; values of manually added items are never "extracted".
 */
export function provenance(
  initial: Review,
  current: Review,
  itemId: string | null,
  field: ItemField | "total",
): Provenance {
  const read = (review: Review): string | undefined => {
    if (itemId === null || field === "total") return review.total;
    const item = review.items.find((row) => row.id === itemId);
    return item ? item[field as ItemField] : undefined;
  };
  const now = (read(current) ?? "").trim();
  const before = read(initial)?.trim();
  if (before === undefined) return now ? "corrected" : "missing";
  if (now === before) return now ? "extracted" : "missing";
  return "corrected";
}

export function missingFields(review: Review): number {
  return (
    (parseMoney(review.total) === null ? 1 : 0) +
    (review.items.length === 0 ? 1 : 0) +
    review.items.reduce(
      (count, item) =>
        count +
        (!item.description.trim() ? 1 : 0) +
        (parseQuantity(item.quantity) === null ? 1 : 0) +
        (parseMoney(item.unitPrice) === null ? 1 : 0) +
        (parseMoney(item.lineTotal) === null ? 1 : 0),
      0,
    )
  );
}
