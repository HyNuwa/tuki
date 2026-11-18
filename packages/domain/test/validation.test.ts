import { describe, expect, it } from "vitest";
import { anchorTicket } from "../src/anchor.js";
import { normalizeTicket } from "../src/normalize.js";
import { validateTicket } from "../src/validate.js";
import { argentina } from "../src/countries/ar.js";
import { defaultPipelineConfig } from "../src/config.js";
import { ticket, lines, geometry } from "./synthetic.js";
import type { ValidationContext } from "../src/validate.js";
import type { Validation } from "../src/types.js";

function check(input = ticket(), context: Partial<ValidationContext> = {}, country = argentina, config = defaultPipelineConfig) {
  return validateTicket(anchorTicket(normalizeTicket(input, country), lines(), country, geometry), country, { today: "2026-11-17", ...context }, config);
}
const rule = (result: ReturnType<typeof check>, id: Validation["id"]) => result.validaciones.filter(validation => validation.id === id).map(validation => validation.resultado);
describe("E8 deterministic validations", () => {
  it.each([["30-00000000-7", "ok"], ["30-00000000-8", "falla"], ["", "no_aplica"], ["bad", "falla"]])("V1 validates optional fiscal ID %s", (id, expected) => {
    const input = ticket(); input.comercio.id_fiscal = id;
    expect(rule(check(input), "V1")).toEqual([expected]);
  });
  it.each([["10/11/26", "ok"], ["18/11/26", "falla"], ["31/02/26", "falla"], ["", "no_aplica"]])("V2 checks validity and future date %s", (date, expected) => {
    const input = ticket(); input.comprobante.fecha = date;
    const result = check(input);
    expect(rule(result, "V2")).toEqual([expected]);
    if (expected === "falla") expect(result.ticket.campos["comprobante.fecha"]?.estado).toBe("dudoso");
  });
  it.each([["100,00", "ok"], ["100,01", "ok"], ["99,99", "ok"], ["100,02", "falla"], ["99,98", "falla"]])("V3 one-minimum-unit tolerance includes its boundary %s", (amount, expected) => {
    const input = ticket(); input.items[0]!.importe = amount;
    expect(rule(check(input), "V3")).toEqual([expected]);
  });
  it("V3 uses exact fractional arithmetic and never rounds or repairs values", () => {
    const input = ticket(); input.items[0] = { descripcion: "SYNTHETIC BREAD", cantidad: "0.5", precio_unitario: "0,05", importe: "0,03" };
    const before = structuredClone(input);
    expect(rule(check(input), "V3")).toEqual(["ok"]);
    expect(input).toEqual(before);
    input.items[0]!.cantidad = "9007199254740993"; input.items[0]!.precio_unitario = "1,00"; input.items[0]!.importe = "9007199254740993,00";
    expect(rule(check(input), "V3")).toEqual(["ok"]);
  });
  it("V3 is not applicable only when a required printed operand is missing", () => {
    const input = ticket(); input.items[0]!.cantidad = "";
    expect(rule(check(input), "V3")).toEqual(["no_aplica"]);
    input.items[0]!.cantidad = "bad";
    expect(rule(check(input), "V3")).toEqual(["falla"]);
  });
  it.each([["101,00", "ok"], ["99,00", "ok"], ["101,01", "falla"], ["98,99", "falla"]])("V4 total tolerance includes its boundary %s", (total, expected) => {
    const input = ticket(); input.totales.total = total;
    expect(rule(check(input), "V4")).toEqual([expected]);
  });
  it("V4 subtracts discounts and uses country tax inclusion configuration", () => {
    const input = ticket(); input.totales.descuentos = "10,00"; input.totales.total = "90,00"; input.totales.impuestos[0]!.importe = "21,00";
    expect(rule(check(input), "V4")).toEqual(["ok"]);
    input.totales.total = "111,00";
    expect(rule(check(input, {}, { ...argentina, impuestos_incluidos: false }), "V4")).toEqual(["ok"]);
    input.totales.descuentos = "bad";
    expect(rule(check(input), "V4")).toEqual(["falla"]);
  });
  it("V4 never ignores an invalid or missing item amount", () => {
    const input = ticket(); input.items.push({ ...input.items[0]!, importe: "" });
    expect(rule(check(input), "V4")).toEqual(["falla"]);
  });
  it("V3/V4 tolerances can be overridden through configuration", () => {
    const input = ticket(); input.items[0]!.importe = "100,01"; input.totales.total = "101,01";
    const result = check(input, {}, argentina, { ...defaultPipelineConfig, lineTolerance: "0.00", totalTolerance: "0.00" });
    expect(rule(result, "V3")).toEqual(["falla"]); expect(rule(result, "V4")).toEqual(["falla"]);
  });
  it("V5 requires total and at least one described item with an amount", () => {
    expect(rule(check(), "V5")).toEqual(["ok"]);
    const input = ticket(); input.items[0]!.descripcion = "";
    expect(rule(check(input), "V5")).toEqual(["falla"]);
    input.items = [];
    expect(rule(check(input), "V5")).toEqual(["falla"]);
    input.items = ticket().items; input.totales.total = "";
    expect(rule(check(input), "V5")).toEqual(["falla"]);
  });
  it("V6 requires actual total evidence, not arithmetic agreement", () => {
    expect(rule(check(), "V6")).toEqual(["ok"]);
    const input = ticket(); input.totales.total = "101,00";
    expect(rule(check(input), "V6")).toEqual(["falla"]);
  });
  it("V7 compares only QR-provided canonical values and remains informative", () => {
    expect(rule(check(), "V7")).toEqual(["no_aplica"]);
    expect(rule(check(ticket(), { qr: { campos: { "totales.total": "100.00", "comprobante.fecha": "2026-11-10" } } }), "V7")).toEqual(["ok"]);
    const result = check(ticket(), { qr: { campos: { "totales.total": "999.00" } } });
    expect(rule(result, "V7")).toEqual(["falla"]); expect(result.qr_coincide).toBe(false);
  });
  it("V8 marks a matching logical duplicate without rejecting it", () => {
    const prior = { pais: "AR", fecha: "2026-11-10", hora: "18:42:00", total: "100.00", cantidad_items: 1, numero: "00001234" };
    const result = check(ticket(), { existingTickets: [prior] });
    expect(rule(result, "V8")).toEqual(["falla"]); expect(result.marcas).toEqual(["posible_duplicado"]);
    expect(rule(check(ticket(), { existingTickets: [{ ...prior, numero: "other" }] }), "V8")).toEqual(["ok"]);
    expect(rule(check(ticket(), { existingTickets: [{ ...prior, pais: "ZZ" }] }), "V8")).toEqual(["ok"]);
    const input = ticket(); input.comprobante.numero = "";
    expect(rule(check(input, { existingTickets: [{ ...prior, numero: null }] }), "V8")).toEqual(["falla"]);
  });
});
