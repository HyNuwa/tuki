import { describe, expect, it } from "vitest";
import {
  createReview,
  provenance,
  updateItem,
  reviewSnapshot,
  type Draft,
} from "./review";

const draft: Draft = {
  schemaVersion: "tuki-demo-draft/1",
  parserVersion: "rules/1",
  status: "needs_review",
  fiscalStatus: "pending",
  commercialEligible: false,
  currency: "ARS",
  scale: 2,
  items: [
    {
      id: "item-0",
      description: "LECHE",
      quantity: null,
      unitPriceAtomic: null,
      lineTotalAtomic: "250000",
      sourceRegionIds: ["r0"],
    },
  ],
  totalAtomic: null,
  unresolvedLines: [],
  issues: ["missing_fields", "fiscal_pending"],
};

describe("editable review boundary", () => {
  it("keeps missing values empty rather than inventing a quantity or unit price", () => {
    const review = createReview(draft);
    expect(review.items[0].quantity).toBe("");
    expect(review.items[0].unitPrice).toBe("");
    expect(review.items[0].lineTotal).toBe("2500,00");
    expect(review.total).toBe("");
  });
  it("records corrections without mutating OCR-derived evidence or accepting the receipt", () => {
    const original = structuredClone(draft);
    const review = createReview(draft);
    const edited = updateItem(review, "item-0", "description", "LECHE ENTERA");
    const saved = reviewSnapshot({ ...edited, total: "2.500,00" });
    expect(saved.items[0].description).toBe("LECHE ENTERA");
    expect(saved.items[0].sourceRegionIds).toEqual(["r0"]);
    expect(saved.totalAtomic).toBe("250000");
    expect(saved.items[0].quantity).toBeNull();
    expect(saved.fiscalStatus).toBe("pending");
    expect(saved.commercialEligible).toBe(false);
    expect(saved.status).toBe("needs_review");
    expect(draft).toEqual(original);
  });
  it("does not turn invalid or missing corrections into zero", () => {
    const review = createReview(draft);
    const saved = reviewSnapshot({ ...review, total: "abc" });
    expect(saved.totalAtomic).toBeNull();
  });
});

describe("value provenance", () => {
  it("marks unchanged parser values as extracted and empty ones as not detected", () => {
    const review = createReview(draft);
    expect(provenance(review, review, "item-0", "lineTotal")).toBe("extracted");
    expect(provenance(review, review, "item-0", "quantity")).toBe("missing");
    expect(provenance(review, review, null, "total")).toBe("missing");
  });
  it("marks any manual change as corrected, including clearing an extracted value", () => {
    const initial = createReview(draft);
    const typed = updateItem(initial, "item-0", "quantity", "2");
    expect(provenance(initial, typed, "item-0", "quantity")).toBe("corrected");
    const cleared = updateItem(initial, "item-0", "lineTotal", "");
    expect(provenance(initial, cleared, "item-0", "lineTotal")).toBe("corrected");
    expect(provenance(initial, { ...initial, total: "2.500,00" }, null, "total")).toBe("corrected");
  });
  it("treats values of manually added items as corrected, never extracted", () => {
    const initial = createReview(draft);
    const added = {
      ...initial,
      items: [
        ...initial.items,
        { id: "manual-0", description: "PAN", quantity: "", unitPrice: "", lineTotal: "", sourceRegionIds: [] },
      ],
    };
    expect(provenance(initial, added, "manual-0", "description")).toBe("corrected");
    expect(provenance(initial, added, "manual-0", "quantity")).toBe("missing");
  });
});
