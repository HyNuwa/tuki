import { expect, it } from "vitest";
import { parseMoney, moneyForEditor, arithmeticWarnings, stateLabels, fieldProvenance, createReview, type Draft } from "../src/index.js";

it("parses and formats atomic money beyond safe float precision", () => {
  expect(parseMoney("90.071.992.547.409,93")).toBe("9007199254740993");
  expect(moneyForEditor("9007199254740993")).toBe("90071992547409,93");
  expect(parseMoney("0")).toBe("0");
  expect(parseMoney("1.25")).toBeNull();
  expect(parseMoney("-1")).toBeNull();
});

it("warns about both arithmetic mismatches without correcting evidence", () => {
  const review = { ...createReview(draft), total: "99,99" };
  const before = structuredClone(review);
  expect(arithmeticWarnings(review)).toEqual([
    { code: "line_mismatch", itemId: "i" }, { code: "total_mismatch" },
  ]);
  expect(review).toEqual(before);
  const fractional = { ...review, total: "0,03", items: [{ ...review.items[0]!, quantity: "0,5", unitPrice: "0,05", lineTotal: "0,03" }] };
  expect(arithmeticWarnings(fractional)).toEqual([{ code: "line_mismatch", itemId: "i" }]);
});

it("distinguishes missing, extracted and manually cleared values", () => {
  expect(fieldProvenance("", "")).toBe("missing");
  expect(fieldProvenance("OCR", "OCR")).toBe("extracted");
  expect(fieldProvenance("OCR", "")).toBe("corrected");
  expect(fieldProvenance(undefined, "Manual")).toBe("corrected");
});

it("provides the exact seven contribution labels", () => {
  expect(Object.values(stateLabels)).toEqual(["Cargado", "Procesando", "Extracción disponible", "Requiere revisión", "Revisión completada", "Validación fiscal pendiente", "Error de procesamiento"]);
});

const draft: Draft = {
  schemaVersion: "tuki-demo-draft/1", parserVersion: "rules/1", status: "needs_review",
  fiscalStatus: "pending", commercialEligible: false, currency: "ARS", scale: 2,
  items: [{ id: "i", description: "PAN", quantity: "2", unitPriceAtomic: "100", lineTotalAtomic: "150", sourceRegionIds: ["r0"] }],
  totalAtomic: "150", unresolvedLines: [], issues: [],
};
