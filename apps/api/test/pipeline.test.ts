import { expect, it } from "vitest";
import { executeTicket } from "../src/ingestion/pipeline.js";
import type { PipelineArtifacts } from "../src/ingestion/pipeline.js";
import { syntheticEvidence, syntheticTicket } from "./synthetic.js";

it("persists invalid raw attempts unchanged and returns content error without a third attempt", async () => {
  const saved: PipelineArtifacts[] = []; let attempts = 0;
  const result = await executeTicket({ ticketId: "synthetic", country: "AR", image: new Uint8Array([1]),
    today: "2026-11-17", hmacKey: new TextEncoder().encode("synthetic-test-key-not-a-secret"),
    bridge: syntheticEvidence(), extractor: { versions: { prompt: "synthetic", schema: "ticket.v1", glm_ocr: "synthetic" },
      async generate() { attempts++; return { raw: "  invalid\n", complete: true, model: "synthetic" }; } },
    signal: AbortSignal.timeout(1000), async persist(artifact) { saved.push(artifact); },
  });
  expect(attempts).toBe(2);
  expect(result.estado).toBe("Error de procesamiento"); expect(result.motivo).toBe("extraccion_invalida");
  expect(saved.filter(a => a.stage === "E5").map(a => a.raw)).toEqual(["  invalid\n", "  invalid\n"]);
});

it("accepts grounded synthetic output and rejects an empty item amount without filling it", async () => {
  for (const empty of [false, true]) {
    const input = syntheticTicket(); if (empty) input.items[0]!.importe = "";
    const result = await executeTicket({ ticketId: "synthetic", country: "AR", image: new Uint8Array([1]), today: "2026-11-17",
      hmacKey: new TextEncoder().encode("synthetic-test-key-not-a-secret"), bridge: syntheticEvidence(),
      extractor: { versions: { prompt: "synthetic", schema: "ticket.v1", glm_ocr: "synthetic" }, async generate() { return { raw: JSON.stringify(input), complete: true, model: "synthetic" }; } },
      signal: AbortSignal.timeout(1000), async persist() {},
    });
    expect(result.estado).toBe(empty ? "Rechazado" : "Aceptado");
    if ("campos" in result && empty) {
      expect(result.campos["items.0.importe"]?.estado).toBe("faltante");
      expect(result.validaciones.find(v => v.id === "V4")?.resultado).toBe("falla"); expect(result.dataset).toBeNull();
    } else expect(result.dataset).not.toBeNull();
  }
});
