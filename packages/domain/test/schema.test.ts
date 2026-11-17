import { describe, expect, it } from "vitest";
import { parseTicketJson, validateTicketV1 } from "../src/schema.js";
import { ticket } from "./synthetic.js";

describe("ticket.v1 trust boundary", () => {
  it("accepts all literal strings, empty lists and preserves item order", () => {
    const input = ticket();
    input.items.push({ descripcion: "SECOND", cantidad: "", precio_unitario: "", importe: "" });
    expect(validateTicketV1(input)).toEqual({ success: true, data: input });
    expect(validateTicketV1({ ...input, items: [] }).success).toBe(true);
  });
  it("requires every key, including missing-valued fields", () => {
    const input: unknown = { ...ticket(), pago: {} };
    expect(validateTicketV1(input).success).toBe(false);
  });
  it.each([null, 2, true, [], {}])("rejects a non-string leaf: %j", value => {
    expect(validateTicketV1({ ...ticket(), pago: { forma: value } }).success).toBe(false);
  });
  it.each(["root", "merchant", "item", "tax"])("rejects extra keys at %s", location => {
    const input = ticket();
    const target = location === "root" ? input : location === "merchant" ? input.comercio
      : location === "item" ? input.items[0]! : input.totales.impuestos[0]!;
    Object.assign(target, { unexpected: "not allowed" });
    expect(validateTicketV1(input).success).toBe(false);
  });
  it.each([null, [], "{}", { comercio: {} }])("rejects wrong object shapes: %j", input => {
    expect(validateTicketV1(input).success).toBe(false);
  });
  it("parses JSON without repairing, stripping fences or ignoring malformed content", () => {
    expect(parseTicketJson(JSON.stringify(ticket())).success).toBe(true);
    expect(parseTicketJson("```json\n{}\n```").success).toBe(false);
  });
  it("rejects a sparse item list instead of silently skipping its absent entries", () => {
    const input = ticket(); input.items = new Array(1);
    expect(validateTicketV1(input).success).toBe(false);
  });
});
