import { describe, expect, it } from "vitest";
import { errorMessage } from "../src/api.js";
import { anchorLabels, fieldLabel, formatScore, invertHomography, reasonText, ticketPhase, toDisplayBox } from "../src/ticket.js";
import { accepted, detail, failed, rejected } from "./fixtures.js";

describe("ticketPhase", () => {
  it("maps queue status while the ticket has no final state", () => {
    expect(ticketPhase(detail())).toEqual({ kind: "queued" });
    expect(ticketPhase(detail({ job: { id: "j", status: "running", attempts: 1 } }))).toEqual({ kind: "running" });
  });
  it("maps the three final states", () => {
    expect(ticketPhase(accepted())).toEqual({ kind: "final", state: "accepted" });
    expect(ticketPhase(rejected())).toEqual({ kind: "final", state: "rejected" });
    expect(ticketPhase(failed())).toEqual({ kind: "final", state: "processing_error" });
  });
  it("treats unknown states, a finished job without state and a missing job as unknown", () => {
    expect(ticketPhase(detail({ state: "needs_review" as never }))).toEqual({ kind: "unknown" });
    expect(ticketPhase(detail({ job: { id: "j", status: "succeeded", attempts: 1 } }))).toEqual({ kind: "unknown" });
    expect(ticketPhase(detail({ job: null }))).toEqual({ kind: "unknown" });
  });
});

describe("reasonText", () => {
  it("explains every processing-error and rejection reason in Spanish, never the raw code", () => {
    const codes = ["archivo_invalido", "pais_no_soportado", "imagen_ilegible", "texto_ilegible", "extraccion_invalida", "error_interno",
      "incompleto", "evidencia", "cobertura", "consistencia", "completitud", "legibilidad"];
    const texts = codes.map(reasonText);
    expect(new Set(texts).size).toBe(codes.length);
    for (const [index, text] of texts.entries()) expect(text).not.toContain(codes[index]);
    expect(reasonText("pais_no_soportado")).toContain("Argentina");
    expect(reasonText("nuevo_motivo")).toBe(reasonText(null));
  });
});

describe("anchoring and field labels", () => {
  it("labels the four anchoring states and known field paths", () => {
    expect(anchorLabels).toEqual({ verificado: "Verificado en el OCR", dudoso: "Dudoso", no_verificado: "No verificado", faltante: "Faltante" });
    expect(fieldLabel("comercio.razon_social")).toBe("Razón social");
    expect(fieldLabel("totales.impuestos.1.importe")).toBe("Impuesto 2 · importe");
    expect(fieldLabel("algo.nuevo")).toBe("algo.nuevo");
  });
  it("formats scores with a decimal comma", () => {
    expect(formatScore(0.93)).toBe("0,93");
    expect(formatScore(1)).toBe("1,00");
  });
});

describe("geometry", () => {
  it("inverts toOriginal to draw original-raster boxes over the preprocessed image", () => {
    const inverse = invertHomography([2, 0, 10, 0, 2, 20, 0, 0, 1])!;
    expect(toDisplayBox([[30, 40], [50, 40], [50, 60], [30, 60]], { width: 100, height: 100, toOriginal: [2, 0, 10, 0, 2, 20, 0, 0, 1] }))
      .toEqual([[10, 10], [20, 10], [20, 20], [10, 20]]);
    expect(inverse.map(v => Math.round(v * 1000) / 1000 + 0)).toEqual([0.5, 0, -5, 0, 0.5, -10, 0, 0, 1]);
  });
  it("uses identity without a transform and refuses a singular one", () => {
    expect(toDisplayBox([[1, 2], [3, 2], [3, 4], [1, 4]], { width: 10, height: 10 })).toEqual([[1, 2], [3, 2], [3, 4], [1, 4]]);
    expect(invertHomography([0, 0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
    expect(toDisplayBox([[1, 2], [3, 2], [3, 4], [1, 4]], { width: 10, height: 10, toOriginal: [0, 0, 0, 0, 0, 0, 0, 0, 0] })).toBeNull();
  });
});

describe("api error messages", () => {
  it("maps the T8 upload codes and falls back to a generic message", () => {
    expect(errorMessage("consent_required")).toContain("consentimiento");
    expect(errorMessage("country_required")).toContain("país");
    expect(errorMessage("archivo_invalido")).toContain("PNG");
    expect(errorMessage("sin_codigo")).toBe(errorMessage(null));
  });
});
