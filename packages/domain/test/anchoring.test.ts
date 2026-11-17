import { describe, expect, it } from "vitest";
import { anchorTicket } from "../src/anchor.js";
import { normalizeTicket } from "../src/normalize.js";
import { argentina } from "../src/countries/ar.js";
import { defaultPipelineConfig } from "../src/config.js";
import { ticket, line, lines, geometry } from "./synthetic.js";
import type { OcrLine } from "../src/types.js";

function anchor(input = ticket(), evidence: readonly OcrLine[] = lines()) {
  return anchorTicket(normalizeTicket(input, argentina), evidence, argentina, geometry);
}
describe("E7 anchoring", () => {
  it("verifies exact numbers without changing raw or canonical values", () => {
    const result = anchor();
    expect(result.campos["totales.total"]).toEqual({ raw: "100,00", valor: "100.00", estado: "verificado", line_ids: ["L6"], box: [[0, 120], [400, 120], [400, 135], [0, 135]], texto_ocr: "TOTAL $ 100,00", similitud: 1 });
  });
  it("never fuzzes a changed digit or matches an embedded numeric substring", () => {
    const input = ticket(); input.totales.total = "101,00";
    expect(anchor(input).campos["totales.total"]?.estado).toBe("no_verificado");
    input.totales.total = "100,00";
    expect(anchor(input, [line("TOTAL 2100,00")]).campos["totales.total"]?.estado).toBe("no_verificado");
  });
  it("compares alphanumerics without separators, accents, case or repeated spaces", () => {
    const input = ticket(); input.comercio.razon_social = "MERCÁDO  SINTÉTICO"; input.comercio.id_fiscal = "30-00000000-7";
    const result = anchor(input, [line("mercado sintetico"), line("CUIT 30 00000000 7", 1)]);
    expect(result.campos["comercio.razon_social"]?.estado).toBe("verificado");
    expect(result.campos["comercio.id_fiscal"]?.estado).toBe("verificado");
  });
  it.each([["SYNTHETIC BREAO", "verificado"], ["SYNTHETIC XXXX", "dudoso"], ["ZZZZZZZZZZZZZZ", "no_verificado"]])("uses edit distance for OCR text %s", (text, state) => {
    expect(anchor(ticket(), [line(text + " 100,00")]).campos["items.0.descripcion"]?.estado).toBe(state);
  });
  it("keeps both texts for a doubtful match and never repairs extracted content", () => {
    const field = anchor(ticket(), [line("SYNTHETIC XXXX 100,00")]).campos["items.0.descripcion"]!;
    expect(field.raw).toBe("SYNTHETIC BREAD"); expect(field.valor).toBe("SYNTHETIC BREAD");
    expect(field.texto_ocr).toBe("SYNTHETIC XXXX 100,00"); expect(field.line_ids).toEqual(["L0"]);
  });
  it("marks empty fields missing and nonempty normalization failures doubtful", () => {
    const input = ticket(); input.comprobante.fecha = "31/02/26";
    const result = anchor(input, [line("31/02/26")]);
    expect(result.campos["totales.subtotal"]?.estado).toBe("faltante");
    expect(result.campos["comprobante.fecha"]?.estado).toBe("dudoso");
    expect(result.campos["comprobante.fecha"]?.valor).toBeNull();
  });
  it("prefers total keywords as whole words, not SUBTOTAL's TOTAL suffix", () => {
    const result = anchor(ticket(), [line("SUBTOTAL 100,00"), line("TOTAL 100,00", 1)]);
    expect(result.campos["totales.total"]?.line_ids).toEqual(["L1"]);
  });
  it("uses country keyword configuration without hard-coded country text", () => {
    const country = { ...argentina, palabras_clave: { total: ["SUMME"] } };
    const result = anchorTicket(normalizeTicket(ticket(), country), [line("TOTAL 100,00"), line("SUMME 100,00", 1)], country, geometry);
    expect(result.campos["totales.total"]?.line_ids).toEqual(["L1"]);
  });
  it("prefers the first merchant/header appearance", () => {
    const result = anchor(ticket(), [line("SYNTHETIC MARKET"), line("SYNTHETIC MARKET", 1)]);
    expect(result.campos["comercio.razon_social"]?.line_ids).toEqual(["L0"]);
  });
  it("anchors repeated items top-to-bottom, avoiding reuse of equal numbers", () => {
    const input = ticket(); input.items.push({ ...input.items[0]! });
    const result = anchor(input, [line("SYNTHETIC BREAD 2 50,00 100,00"), line("SYNTHETIC BREAD 2 50,00 100,00", 1)]);
    expect(result.campos["items.0.importe"]?.line_ids).toEqual(["L0"]);
    expect(result.campos["items.1.importe"]?.line_ids).toEqual(["L1"]);
    expect(result.campos["items.1.descripcion"]?.line_ids).toEqual(["L1"]);
  });
  it("allows numeric reuse only when there is no other candidate", () => {
    const input = ticket(); input.items.push({ ...input.items[0]! });
    const result = anchor(input, [line("SYNTHETIC BREAD 2 50,00 100,00")]);
    expect(result.campos["items.1.importe"]?.estado).toBe("verificado");
  });
  it.each([2, 3])("limits description/amount distance to two lines: %s", distance => {
    const evidence = [line("SYNTHETIC BREAD"), ...Array.from({ length: distance - 1 }, (_, i) => line("ZZZZZZ", i + 1)), line("100,00", distance)];
    expect(anchor(ticket(), evidence).campos["items.0.importe"]?.estado).toBe(distance === 2 ? "verificado" : "no_verificado");
  });
  it("does not anchor a later item above its predecessor", () => {
    const input = ticket(); input.items.push({ ...input.items[0]!, descripcion: "SECOND ITEM", importe: "5,00" });
    const result = anchor(input, [line("SECOND ITEM 5,00"), line("SYNTHETIC BREAD 100,00", 1)]);
    expect(result.campos["items.1.descripcion"]?.estado).not.toBe("verificado");
    expect(result.campos["items.1.importe"]?.estado).not.toBe("verificado");
  });
  it("retains omitted item lines and every unassociated OCR line with boxes", () => {
    const evidence = [...lines(), line("UNMODELED ITEM 3,00", 8)];
    const result = anchor(ticket(), evidence);
    expect(result.texto_no_interpretado).toEqual([evidence[8]]);
    const associated = new Set(Object.values(result.campos).flatMap(field => field.line_ids));
    expect(evidence.every(entry => associated.has(entry.line_id) || result.texto_no_interpretado.some(other => other.line_id === entry.line_id))).toBe(true);
  });
  it("maps boxes to original pixels and clips to original bounds", () => {
    const result = anchorTicket(normalizeTicket(ticket(), argentina), [line("TOTAL 100,00")], argentina, { width: 200, height: 100, toOriginal: [1, 0, 10, 0, 1, 10, 0, 0, 1] });
    expect(result.campos["totales.total"]?.box).toEqual([[10, 10], [200, 10], [200, 25], [10, 25]]);
    for (const field of Object.values(result.campos)) if (field.estado === "verificado") {
      expect(field.line_ids.length).toBeGreaterThan(0);
      expect(field.box!.every(([x, y]) => x >= 0 && x <= 200 && y >= 0 && y <= 100)).toBe(true);
    }
  });
  it("uses character boxes only for the exact matching span", () => {
    const evidence: OcrLine = { ...line("TOTAL 100,00"), characters: [{ start: 6, end: 12, box: [[100, 0], [190, 0], [190, 15], [100, 15]] }] };
    expect(anchor(ticket(), [evidence]).campos["totales.total"]?.box).toEqual(evidence.characters![0]!.box);
  });
  it("cannot verify a field using invalid or off-image evidence", () => {
    const evidence: OcrLine = { ...line("TOTAL 100,00"), box: [[-20, -20], [-10, -20], [-10, -10], [-20, -10]] };
    expect(anchor(ticket(), [evidence]).campos["totales.total"]?.estado).toBe("no_verificado");
  });
  it("takes text thresholds from configuration", () => {
    const result = anchorTicket(normalizeTicket(ticket(), argentina), [line("SYNTHETIC BREAO 100,00")], argentina, geometry, { ...defaultPipelineConfig.anchoring, verifiedThreshold: 1 });
    expect(result.campos["items.0.descripcion"]?.estado).toBe("dudoso");
  });
  it("keeps a later item below all lines of a preceding multi-line item", () => {
    const input = ticket(); input.items.push({ ...input.items[0]!, descripcion: "SECOND ITEM", importe: "5,00" });
    const result = anchor(input, [line("SYNTHETIC BREAD"), line("SECOND ITEM 5,00", 1), line("100,00", 2)]);
    expect(result.campos["items.1.descripcion"]?.estado).not.toBe("verificado");
    expect(result.campos["items.1.importe"]?.estado).not.toBe("verificado");
  });
  it("does not silently accept duplicate OCR line identifiers", () => {
    expect(() => anchor(ticket(), [line("A"), line("B")])).toThrow("invalid_ocr_geometry");
  });
  it("unions the original-image boxes when text wraps across OCR lines", () => {
    const result = anchor(ticket(), [line("SYNTHETIC"), line("MARKET", 1)]);
    expect(result.campos["comercio.razon_social"]).toMatchObject({ estado: "verificado", line_ids: ["L0", "L1"], box: [[0, 0], [400, 0], [400, 35], [0, 35]], texto_ocr: "SYNTHETIC\nMARKET", similitud: 1 });
  });
  it("does not reuse a numeric line while an unused candidate exists, even with a keyword", () => {
    const input = ticket(); input.items = [];
    input.totales.subtotal = "100,00";
    const result = anchor(input, [line("SUBTOTAL TOTAL 100,00"), line("100,00", 1)]);
    expect(result.campos["totales.subtotal"]?.line_ids).toEqual(["L0"]);
    expect(result.campos["totales.total"]?.line_ids).toEqual(["L1"]);
  });
  it("uses exact item text ahead of a partial OCR decoy", () => {
    const result = anchor(ticket(), [line("SYNTHETIC XXXX 100,00"), line("SYNTHETIC BREAD 100,00", 1)]);
    expect(result.campos["items.0.descripcion"]?.estado).toBe("verificado");
    expect(result.campos["items.0.descripcion"]?.line_ids).toEqual(["L1"]);
  });
  it.each([["XXXDEFGHIJKLMNOPQRST", 0.85, "verificado"], ["XXXXXXXXIJKLMNOPQRST", 0.6, "dudoso"], ["XXXXXXXXXJKLMNOPQRST", 0.55, "no_verificado"]])("honors inclusive text thresholds for %s", (text, expected, state) => {
    const input = ticket(); input.items[0]!.descripcion = "ABCDEFGHIJKLMNOPQRST";
    const field = anchor(input, [line(`${text} 100,00`)]).campos["items.0.descripcion"]!;
    expect(field.estado).toBe(state);
    if (state !== "no_verificado") expect(field.similitud).toBe(expected);
  });
});
