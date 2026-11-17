import { createHash } from "node:crypto";
import { countryModules, defaultPipelineConfig, parseTicketJson, processTicket, processingError,
  type LogicalTicket, type PipelineConfig, type PipelineResult, type ProcessingError } from "@tuki/domain";
import { ContentFailure, type OcrBridge, type OcrEvidence, type PreparedImage } from "./bridge.js";
import type { Extractor } from "./ollama.js";

export type PipelineArtifacts =
  | { stage: "E2"; prepared: PreparedImage }
  | { stage: "E4"; evidence: OcrEvidence; durationMs: number }
  | { stage: "E5"; raw: string; attempt: number; complete: boolean; model: string; durationMs: number }
  | { stage: "E6_E9"; durationMs: number; durations: Record<string, number> };
export type ExecuteInput = {
  ticketId: string; country: string; image: Uint8Array; today: string; hmacKey: Uint8Array;
  bridge: OcrBridge; extractor: Extractor; signal: AbortSignal; config?: PipelineConfig; minOcrConfidence?: number;
  existingTickets?: readonly LogicalTicket[]; persist(artifact: PipelineArtifacts): Promise<void>;
};

/** E1-E5 I/O orchestration. E6-E9 and dataset privacy stay exclusively in domain. */
export async function executeTicket(input: ExecuteInput): Promise<PipelineResult | ProcessingError> {
  const { signal, bridge, extractor } = input;
  const country = Object.hasOwn(countryModules, input.country) ? countryModules[input.country] : undefined;
  if (!country) return processingError(input.ticketId, input.country, "pais_no_soportado");
  try {
    signal.throwIfAborted();
    const prepared = await bridge.prepare(input.image, signal);
    signal.throwIfAborted(); await input.persist({ stage: "E2", prepared });
    const startedOcr = performance.now(), evidence = await bridge.extract(prepared.image, signal);
    signal.throwIfAborted(); await input.persist({ stage: "E4", evidence, durationMs: performance.now() - startedOcr });
    if (!evidence.lines.length || evidence.lines.reduce((sum, line) => sum + line.score, 0) / evidence.lines.length < (input.minOcrConfidence ?? .6))
      return processingError(input.ticketId, input.country, "texto_ilegible");
    for (let attempt = 1; attempt <= 2; attempt++) {
      const started = performance.now();
      const output = await extractor.generate(prepared.image, signal);
      signal.throwIfAborted();
      // Persist the untouched response even if JSON/schema/token limit validation fails.
      await input.persist({ stage: "E5", raw: output.raw, complete: output.complete, model: output.model, attempt, durationMs: performance.now() - started });
      if (!output.complete || !parseTicketJson(output.raw).success) continue;
      const config = input.config ?? defaultPipelineConfig;
      const beginDomain = performance.now();
      const starts: Record<string, number> = {}, durations: Record<string, number> = {};
      const result = await processTicket({ ticket_id: input.ticketId, pais: input.country, extraction: output.raw, lines: evidence.lines,
        geometry: prepared.geometry, today: input.today, hmacKey: input.hmacKey,
        qr: prepared.qrPayloads.map(payload => country.leer_qr(payload)).find(qr => qr !== null) ?? null,
        existingTickets: input.existingTickets ?? [], versions: { pipeline: "1.0.0", pp_ocr: evidence.modelVersion,
          glm_ocr: `${extractor.versions.glm_ocr};served=${output.model}`, prompt: extractor.versions.prompt,
          pesos: `sha256:${createHash("sha256").update(JSON.stringify(config)).digest("hex")}` },
      }, countryModules, config, { now: () => performance.now(), observe(event) {
        if (event.phase === "start") starts[event.stage] = event.at;
        else durations[event.stage] = event.at - starts[event.stage]!;
      } });
      signal.throwIfAborted(); await input.persist({ stage: "E6_E9", durationMs: performance.now() - beginDomain, durations });
      return result;
    }
    return processingError(input.ticketId, input.country, "extraccion_invalida");
  } catch (error) {
    if (error instanceof ContentFailure) return processingError(input.ticketId, input.country, error.reason);
    throw error;
  }
}
