// Invented monetary projections from EXTRACTOR-CONTRACT.md, never receipt data.
type ItemTuple = readonly [quantity: string, unitPrice: string, lineTotal: string];
type DiscountTuple = readonly [scope: string, itemIndex: number | null, amount: string, accounting: string];
type Example = {
  id: string;
  items: readonly ItemTuple[];
  discounts: readonly DiscountTuple[];
  total: string;
  qr: string;
  status: "consistent" | "review";
};

export const examples: readonly Example[] = [
  {
    id: "gross", items: [["1", "1000", "1000"], ["1", "500", "500"]],
    discounts: [["item", 0, "100", "deduct_from_items"], ["receipt", null, "50", "deduct_from_items"],
      ["receipt", null, "150", "informational"]],
    total: "1350", qr: "1350", status: "consistent",
  },
  {
    id: "net", items: [["1", "1000", "900"], ["1", "500", "500"]],
    discounts: [["item", 0, "100", "already_in_items"], ["receipt", null, "50", "deduct_from_items"]],
    total: "1350", qr: "1350", status: "consistent",
  },
  {
    id: "mixed", items: [["1", "1000", "1000"], ["1", "500", "450"]],
    discounts: [["item", 0, "100", "deduct_from_items"], ["item", 1, "50", "already_in_items"],
      ["receipt", null, "50", "deduct_from_items"]],
    total: "1300", qr: "1300", status: "consistent",
  },
  {
    id: "package-rounding", items: [["0.666", "1001", "666"]], discounts: [],
    total: "666", qr: "666", status: "consistent",
  },
  {
    id: "zero-priced-item", items: [["1", "0", "0"], ["1", "100", "100"]], discounts: [],
    total: "100", qr: "100", status: "consistent",
  },
  {
    id: "qr-mismatch", items: [["1", "1000", "1000"], ["1", "500", "500"]],
    discounts: [["receipt", null, "150", "deduct_from_items"]],
    total: "1350", qr: "1351", status: "review",
  },
  {
    id: "unknown-effect", items: [["1", "1000", "1000"], ["1", "500", "500"]],
    discounts: [["item", 0, "100", "unknown"]],
    total: "1400", qr: "1400", status: "review",
  },
  {
    id: "bad-reference", items: [["1", "1000", "1000"]],
    discounts: [["item", 2, "100", "deduct_from_items"]],
    total: "900", qr: "900", status: "review",
  },
  {
    id: "double-deduction", items: [["1", "1000", "900"], ["1", "500", "500"]],
    discounts: [["item", 0, "100", "already_in_items"], ["receipt", null, "100", "deduct_from_items"]],
    total: "1400", qr: "1400", status: "review",
  },
  {
    id: "negative-receipt", items: [["1", "100", "100"]],
    discounts: [["receipt", null, "200", "deduct_from_items"]],
    total: "0", qr: "0", status: "review",
  },
];
