import { describe, expect, it } from "vitest";
import { checkAccounting } from "../src/check-accounting.js";
import { examples } from "./contract-examples.js";

const context = { currency: "ARS", scale: 2 };
const receipt = () => ({
  items: [{ quantity: "1", unitPriceAtomic: "100", lineTotalAtomic: "100" }],
  discounts: [] as unknown[],
  totalAtomic: "100",
});
const invalidMoney: unknown[] = [undefined, null, "", "00", "01", "-1", "+1", "1.0",
  "0.1", "1e2", "1,000", " 100", "100 ", "100\n", "100\r", "100\u2028", 100,
  100n, NaN, Infinity, true, {}, [], Symbol("money")];
const discount = (amountAtomic: unknown, extra: Record<string, unknown> = {}) => ({
  scope: "receipt", amountAtomic, accounting: "deduct_from_items", ...extra,
});
// Wrap values so Vitest treats an array value as one argument, not a parameter row.
const singleCases = (values: readonly unknown[]) => values.map((value) => [value] as const);

describe("checkAccounting monetary projection", () => {
  it.each(examples)("matches the documented synthetic example: $id", (example) => {
    const input = {
      items: example.items.map(([quantity, unitPriceAtomic, lineTotalAtomic]) => ({ quantity, unitPriceAtomic, lineTotalAtomic })),
      discounts: example.discounts.map(([scope, itemIndex, amountAtomic, accounting]) => ({
        scope, ...(itemIndex === null ? {} : { itemIndex }), amountAtomic, accounting,
      })),
      totalAtomic: example.total,
    };
    const actual = checkAccounting(input, context, example.qr);
    if (example.status === "consistent") {
      expect(actual).toEqual({ status: "consistent", reconciledTotalAtomic: example.total });
    } else {
      expect(actual.status).toBe("review");
      if (actual.status === "review") expect(actual.issues.length).toBeGreaterThan(0);
    }
  });
  it.each(["100", "101"])("leaves frozen monetary and nonmonetary input unchanged for QR %s", (qr) => {
    const input = { ...receipt(), description: "invented-private-marker", confidence: "not-schema-validated",
      discounts: [discount("5", { label: "invented-private-discount", accounting: "informational" })] };
    const before = structuredClone(input);
    input.items.forEach(Object.freeze);
    input.discounts.forEach(Object.freeze);
    Object.freeze(input.items);
    Object.freeze(input.discounts);
    Object.freeze(input);
    const frozenContext = Object.freeze({ ...context });
    const actual = checkAccounting(input, frozenContext, qr);
    expect(actual.status).toBe(qr === "100" ? "consistent" : "review");
    expect(input).toEqual(before);
    expect(frozenContext).toEqual(context);
    expect(JSON.stringify(actual)).not.toContain("invented-private");
    if (actual.status === "review") expect(actual).toEqual({ status: "review", issues: ["total_mismatch"] });
  });
  it("preserves an entirely free merchandise receipt", () => {
    const input = { items: [{ quantity: "1", unitPriceAtomic: "0", lineTotalAtomic: "0" }], discounts: [], totalAtomic: "0" };
    expect(checkAccounting(input, context, "0")).toEqual({ status: "consistent", reconciledTotalAtomic: "0" });
  });

  it("returns code-only review rather than throwing or exposing malformed object contents", () => {
    const malformed = new Proxy({}, { get() { throw new Error("synthetic-private-marker"); } });
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    for (const value of [malformed, revoked.proxy]) {
      expect(checkAccounting(value, context, "100")).toEqual({ status: "review", issues: ["malformed_input"] });
      expect(checkAccounting(receipt(), value, "100")).toEqual({ status: "review", issues: ["malformed_input"] });
    }
  });

  it.each([["150"], ["60", "50"]])("prevents cumulative item deductions from hiding behind another line: %s", (...amounts) => {
    const input = { items: [...receipt().items, { quantity: "1", unitPriceAtomic: "1000", lineTotalAtomic: "1000" }],
      discounts: amounts.map((amount) => discount(amount, { scope: "item", itemIndex: 0 })),
      totalAtomic: amounts.length === 1 ? "950" : "990" };
    expect(checkAccounting(input, context, input.totalAtomic)).toEqual({ status: "review", issues: ["negative_item_total"] });
  });
  it("prevents receipt deductions from producing a negative total", () => {
    expect(checkAccounting({ ...receipt(), discounts: [discount("200")], totalAtomic: "0" }, context, "0"))
      .toEqual({ status: "review", issues: ["negative_receipt_total"] });
  });
  it("allows a fully discounted genuine merchandise line", () => {
    expect(checkAccounting({ ...receipt(), discounts: [discount("100", { scope: "item", itemIndex: 0 })], totalAtomic: "0" }, context, "0"))
      .toEqual({ status: "consistent", reconciledTotalAtomic: "0" });
  });
  it.each(["99", "101"])("compares the QR exactly without tolerance: %s", (qr) => {
    expect(checkAccounting(receipt(), context, qr)).toEqual({ status: "review", issues: ["total_mismatch"] });
  });
  it("requires the reconciled amount to equal the extracted total as well as the QR", () => {
    expect(checkAccounting({ ...receipt(), totalAtomic: "101" }, context, "101"))
      .toEqual({ status: "review", issues: ["total_mismatch"] });
  });

  it.each(["0", "20"])("reviews unknown effects even when zero or totals balance: %s", (amount) => {
    expect(checkAccounting({ ...receipt(), discounts: [discount(amount, { accounting: "unknown" })] }, context, "100"))
      .toEqual({ status: "review", issues: ["unknown_discount_accounting"] });
  });
  it.each(singleCases([undefined, null, "", "deduct", "DEDUCT_FROM_ITEMS", 0, {}, []]))("reviews invalid classifications: %s", (accounting) => {
    expect(checkAccounting({ ...receipt(), discounts: [discount("0", { accounting })] }, context, "100"))
      .toEqual({ status: "review", issues: ["invalid_discount_accounting"] });
  });
  it.each([undefined, null, "unknown", "ITEM", 0])("reviews missing or invalid discount scope: %s", (scope) => {
    expect(checkAccounting({ ...receipt(), discounts: [discount("0", { scope })] }, context, "100"))
      .toEqual({ status: "review", issues: ["invalid_discount_scope"] });
  });
  it.each([undefined, null, -1, 1, 0.5, "0", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "reviews invalid item references even for informational discounts: %s", (itemIndex) => {
      expect(checkAccounting({ ...receipt(), discounts: [discount("0", { scope: "item", itemIndex, accounting: "informational" })] }, context, "100"))
        .toEqual({ status: "review", issues: ["invalid_item_reference"] });
    },
  );
  it.each([undefined, null, 0])("receipt scope must omit itemIndex entirely: %s", (itemIndex) => {
    expect(checkAccounting({ ...receipt(), discounts: [discount("0", { itemIndex, accounting: "already_in_items" })] }, context, "100"))
      .toEqual({ status: "review", issues: ["invalid_item_reference"] });
  });

  it("subtracts additional discounts only, preserving included and informational amounts", () => {
    const input = { ...receipt(), discounts: [
      discount("10", { scope: "item", itemIndex: 0 }), discount("5"),
      discount("20", { accounting: "already_in_items" }),
      discount("35", { accounting: "informational" }),
    ], totalAtomic: "85" };
    expect(checkAccounting(input, context, "85")).toEqual({ status: "consistent", reconciledTotalAtomic: "85" });
  });
  it.each(singleCases(invalidMoney))("reviews malformed discount amounts: %s", (amount) => {
    expect(checkAccounting({ ...receipt(), discounts: [discount(amount)] }, context, "100").status).toBe("review");
  });
  it.each(singleCases([undefined, null, {}, [], 1]))("reviews malformed discount objects: %s", (value) => {
    expect(checkAccounting({ ...receipt(), discounts: [value] }, context, "100").status).toBe("review");
  });

  it.each(singleCases([undefined, null, {}, [], { currency: "ARS" }, { scale: 2 },
    { currency: "", scale: 2 }, { currency: " \n", scale: 2 }, { currency: 1, scale: 2 },
    ...[-1, 0.5, NaN, Infinity, "2", Number.MAX_SAFE_INTEGER + 1].map((scale) => ({ currency: "ARS", scale })),
  ]))("requires trusted currency and safe nonnegative integer scale: %s", (moneyContext) => {
    expect(checkAccounting(receipt(), moneyContext, "100")).toEqual({ status: "review", issues: ["invalid_context"] });
  });
  it.each(singleCases(invalidMoney))("requires a canonical same-scale QR amount: %s", (qr) => {
    expect(checkAccounting(receipt(), context, qr)).toEqual({ status: "review", issues: ["invalid_qr_amount"] });
  });
  it.each([0, 2, 6, Number.MAX_SAFE_INTEGER])("does not infer a different scale or currency: %s", (scale) => {
    expect(checkAccounting(receipt(), { currency: "SYNTHETIC", scale }, "100").status).toBe("consistent");
  });

  it.each(singleCases([undefined, null, "", "0", "0.0", "00.1", "01", "1.0", "1.500", ".5",
    "1.", "-1", "+1", "1e2", " 1", "1\n", 1, 0.5, NaN, {}, [], true,
  ]))("reviews noncanonical or nonpositive quantities: %s", (quantity) => {
    const input = { ...receipt(), items: [{ ...receipt().items[0], quantity }] };
    expect(checkAccounting(input, context, "100")).toEqual({ status: "review", issues: ["invalid_quantity"] });
  });
  it.each(["1", "0.0000000000000000000000000001", "1.5", "9007199254740993.1"])(
    "preserves exact positive quantities without floating-point conversion: %s", (quantity) => {
      const input = { ...receipt(), items: [{ ...receipt().items[0], quantity }] };
      expect(checkAccounting(input, context, "100").status).toBe("consistent");
    },
  );

  describe.each(["totalAtomic", "unitPriceAtomic", "lineTotalAtomic"] as const)("canonical %s", (field) => {
    it.each(singleCases(invalidMoney))("reviews malformed monetary values: %s", (value) => {
      const input = field === "totalAtomic"
        ? { ...receipt(), totalAtomic: value }
        : { ...receipt(), items: [{ ...receipt().items[0], [field]: value }] };
      expect(checkAccounting(input, context, "100").status).toBe("review");
    });
  });

  it.each(singleCases([undefined, null, "", 0, [], {}, { ...receipt(), items: undefined },
    { ...receipt(), discounts: undefined }, { ...receipt(), discounts: {} },
    { ...receipt(), items: [null] }, { ...receipt(), items: [undefined] },
  ]))("reviews missing or malformed required projection structures: %j", (input) => {
    expect(checkAccounting(input, context, "100").status).toBe("review");
  });

  it("reconciles printed amounts exactly, beyond the safe-number range", () => {
    const input = {
      items: [
        { quantity: "0.666", unitPriceAtomic: "1001", lineTotalAtomic: "666" },
        { quantity: "1", unitPriceAtomic: "9007199254740993", lineTotalAtomic: "9007199254740993" },
      ],
      discounts: [],
      totalAtomic: "9007199254741659",
    };
    expect(checkAccounting(input, context, "9007199254741659")).toEqual({
      status: "consistent", reconciledTotalAtomic: "9007199254741659",
    });
  });
});
