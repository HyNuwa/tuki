import { expect, it } from "vitest";
import { processTicket } from "../src/pipeline.js";
import { geometry, line, ticket } from "./synthetic.js";

it("anchors the literal VAT suffix while returning a clean item description", async () => {
  const input = ticket(); input.items = [{ descripcion: "LECHE (21,00)", cantidad: "", precio_unitario: "", importe: "2.500,00" }];
  input.totales.total = "2.500,00";
  const result = await processTicket({ ticket_id: "synthetic", pais: "AR", extraction: input,
    lines: [line("LECHE (21,00) 2.500,00"), line("TOTAL 2.500,00", 1)], geometry, today: "2026-11-17",
    hmacKey: new TextEncoder().encode("synthetic-not-secret"), versions: { pipeline: "test", pp_ocr: "test", glm_ocr: "test", prompt: "test", pesos: "test" } });
  expect("campos" in result && result.campos["items.0.descripcion"]).toMatchObject({ raw: "LECHE (21,00)", valor: "LECHE", estado: "verificado" });
});
