import { describe, expect, it } from "vitest";
import { processTicket, processingError, stateLabels, isState } from "../src/pipeline.js";
import { argentina } from "../src/countries/ar.js";
import { ticket, lines, geometry } from "./synthetic.js";
import type { PipelineInput } from "../src/pipeline.js";

function input(): PipelineInput {
  return { ticket_id: "synthetic-ticket", pais: "AR", extraction: JSON.stringify(ticket()), lines: lines(), geometry, hmacKey: new Uint8Array([1, 2, 3]), today: "2026-11-17", versions: { pipeline: "1.0.0", pp_ocr: "synthetic/1", glm_ocr: "synthetic/1", prompt: "synthetic/1", pesos: "initial/1" } };
}
describe("pure E6-E9 pipeline", () => {
  it("only exposes the three final ticket states, never manual review or job states", () => {
    expect(Object.values(stateLabels)).toEqual(["Aceptado", "Rechazado", "Error de procesamiento"]);
    expect(isState("accepted")).toBe(true); expect(isState("needs_review")).toBe(false);
    expect(processingError("synthetic", "AR", "imagen_ilegible")).toEqual({ ticket_id: "synthetic", pais: "AR", estado: "Error de procesamiento", motivo: "imagen_ilegible", puntaje: null, dataset: null });
  });
  it("assembles fields, per-item evidence, country version and accepted dataset", async () => {
    const result = await processTicket(input());
    expect(result.estado).toBe("Aceptado");
    if (result.estado === "Error de procesamiento") throw new Error("unexpected processing error");
    expect(result.versiones.modulo_pais).toBe("AR 1.0.0"); expect(result.versiones.esquema).toBe("ticket.v1");
    expect(result.items[0]!.importe?.estado).toBe("verificado");
    expect(result.dataset?.ticket_id).toBe("synthetic-ticket");
    expect(result.texto_no_interpretado).toEqual([]);
  });
  it("is deterministic for identical inputs, versions and reference date", async () => {
    const request = input(), before = structuredClone(request);
    expect(await processTicket(request)).toEqual(await processTicket(request)); expect(request).toEqual(before);
  });
  it("rejects an unsupported country before touching extraction, OCR or a model", async () => {
    const request = input(); request.pais = "ZZ";
    Object.defineProperty(request, "extraction", { get() { throw new Error("must not inspect"); } });
    Object.defineProperty(request, "lines", { get() { throw new Error("must not inspect"); } });
    expect(await processTicket(request)).toEqual(processingError("synthetic-ticket", "ZZ", "pais_no_soportado"));
  });
  it.each(["invalid JSON", "{}", JSON.stringify({ ...ticket(), extra: "no" })])("returns extraction errors without inventing a score: %s", async extraction => {
    expect(await processTicket({ ...input(), extraction })).toEqual(processingError("synthetic-ticket", "AR", "extraccion_invalida"));
  });
  it("supports a new module without edits to the pipeline, score or dataset schema", async () => {
    const country = { ...argentina, codigo: "ZZ", version: "test/1" };
    const result = await processTicket({ ...input(), pais: "ZZ" }, { ZZ: country });
    expect(result.estado).toBe("Aceptado");
    expect(result.pais).toBe("ZZ");
  });
});
