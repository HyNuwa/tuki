import { describe, expect, it } from "vitest";
import { anchorTicket } from "../src/anchor.js";
import { normalizeTicket } from "../src/normalize.js";
import { validateTicket } from "../src/validate.js";
import { scoreTicket } from "../src/score.js";
import { argentina } from "../src/countries/ar.js";
import { defaultPipelineConfig } from "../src/config.js";
import { ticket, lines, line, geometry } from "./synthetic.js";
import type { PipelineConfig } from "../src/config.js";
import type { OcrLine } from "../src/types.js";

function score(input = ticket(), evidence: readonly OcrLine[] = lines(), config: PipelineConfig = defaultPipelineConfig, extra = {}) {
  const validation = validateTicket(anchorTicket(normalizeTicket(input, argentina), evidence, argentina, geometry, config.anchoring), argentina, { today: "2026-11-17", ...extra }, config);
  return scoreTicket(validation, evidence, argentina, config);
}
describe("E9 subscores, decision and caps", () => {
  it("accepts a complete evidenced ticket at the configured threshold", () => {
    expect(score()).toEqual({ estado: "Aceptado", motivo: null, puntaje: 1, subpuntajes: { evidencia: 1, cobertura: 1, consistencia: 1, completitud: 1, legibilidad: 1 }, umbral: 0.85 });
    expect(score(ticket(), lines(), { ...defaultPipelineConfig, acceptanceThreshold: 1 }).estado).toBe("Aceptado");
  });
  it("computes evidence from nonempty money and quantity fields only", () => {
    const input = ticket(); input.items[0]!.precio_unitario = "51,00";
    expect(score(input).subpuntajes.evidencia).toBe(0.75);
  });
  it("coverage penalizes a skipped monetary line while retaining it", () => {
    const result = score(ticket(), [...lines(), line("UNMODELED ITEM 3,00", 8)]);
    expect(result.subpuntajes.cobertura).toBeCloseTo(2 / 3);
    expect(result.puntaje).toBe(0.92);
  });
  it("consistency is half V4 and half the fraction of applicable V3 passes", () => {
    const input = ticket(); input.items.push({ ...input.items[0]!, importe: "1,00" }); input.totales.total = "101,00";
    expect(score(input).subpuntajes.consistencia).toBe(0.75);
    input.items.forEach(item => { item.cantidad = ""; });
    expect(score(input).subpuntajes.consistencia).toBe(1);
  });
  it("completeness counts normalized date, total, merchant and item descriptions/amounts", () => {
    const input = ticket(); input.comprobante.fecha = "18/11/26";
    expect(score(input).subpuntajes.completitud).toBe(0.8);
  });
  it("legibility is the mean OCR confidence and weights round only the final score", () => {
    const evidence = lines().map(entry => ({ ...entry, score: 0.5 }));
    const result = score(ticket(), evidence);
    expect(result.subpuntajes.legibilidad).toBe(0.5);
    expect(result.puntaje).toBe(0.98);
  });
  it("caps unverified totals at 0.50 and never accepts them even below that threshold", () => {
    const input = ticket(); input.totales.total = "101,00";
    const result = score(input);
    expect(result.puntaje).toBe(0.5); expect(result.estado).toBe("Rechazado");
    expect(score(input, lines(), { ...defaultPipelineConfig, acceptanceThreshold: 0.1 }).estado).toBe("Rechazado");
  });
  it("requires V5 even when configured weights otherwise give a passing score", () => {
    const input = ticket(); input.items = [];
    const result = score(input, lines(), { ...defaultPipelineConfig, weights: { evidencia: 0, cobertura: 0, consistencia: 0, completitud: 0, legibilidad: 1 } });
    expect(result.estado).toBe("Rechazado"); expect(result.motivo).toBe("incompleto"); expect(result.puntaje).toBe(1);
  });
  it("returns the lowest subscore as rejection reason with stable tie order", () => {
    const input = ticket(); input.items[0]!.precio_unitario = "51,00";
    const result = score(input, lines(), { ...defaultPipelineConfig, acceptanceThreshold: 1 });
    expect(result.estado).toBe("Rechazado"); expect(result.motivo).toBe("consistencia");
  });
  it("uses configured weights, threshold and cap", () => {
    const input = ticket(); input.totales.total = "101,00";
    const result = score(input, lines(), { ...defaultPipelineConfig, unverifiedTotalCap: 0.3, weights: { evidencia: 0, cobertura: 0, consistencia: 0, completitud: 0, legibilidad: 1 } });
    expect(result.puntaje).toBe(0.3);
    expect(score(ticket(), lines().map(entry => ({ ...entry, score: 0.4 })), { ...defaultPipelineConfig, acceptanceThreshold: 0.4, weights: { evidencia: 0, cobertura: 0, consistencia: 0, completitud: 0, legibilidad: 1 } }).estado).toBe("Aceptado");
  });
  it("fiscal identifiers and QR data never change any subscore", () => {
    const input = ticket(); input.comercio.id_fiscal = "30-00000000-7";
    const baseline = score();
    expect(score(input)).toEqual(baseline);
    expect(score(input, lines(), defaultPipelineConfig, { qr: { campos: { "totales.total": "999.00" } } })).toEqual(baseline);
    input.comercio.id_fiscal = "invalid";
    expect(score(input)).toEqual(baseline);
  });
  it("always returns bounded subscores and a score in [0,1]", () => {
    const result = score(ticket(), []);
    expect(result.estado).toBe("Rechazado");
    expect(Object.values(result.subpuntajes).every(value => value >= 0 && value <= 1)).toBe(true);
    expect(result.puntaje).toBeGreaterThanOrEqual(0); expect(result.puntaje).toBeLessThanOrEqual(1);
  });
});
