import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

export type ModelAttemptFailure = "inference_timeout" | "ollama_output_limit" | "output_token_limit";
export type ExtractionAttempt = { raw: string; complete: boolean; model: string; reason?: ModelAttemptFailure };
export type Extractor = {
  versions: { prompt: string; schema: string; glm_ocr: string };
  generate(image: Uint8Array, signal: AbortSignal): Promise<ExtractionAttempt>;
};
class ModelOutputLimit extends Error {}

/** Local-only transport; never start Ollama or download a model here. */
export async function createOllamaExtractor(config: { url?: string; model?: string; timeoutMs?: number } = {}): Promise<Extractor> {
  const url = new URL(config.url ?? "http://127.0.0.1:11434");
  if (url.protocol !== "http:" || !["127.0.0.1", "[::1]"].includes(url.hostname) || url.username || url.password || url.pathname !== "/" || url.search || url.hash)
    throw new Error("ollama_local_required");
  const model = config.model ?? "tuki-glm-ocr-q4km";
  const prompt = await readFile(new URL("../../../../spikes/ticket-pipeline/prompt-ticket-v1.txt", import.meta.url), "utf8");
  const schemaBytes = await readFile(new URL("../../../../spikes/ticket-pipeline/ticket-v1-format.schema.json", import.meta.url), "utf8");
  const format: unknown = JSON.parse(schemaBytes);
  const hash = (value: string) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
  const versions = { prompt: hash(prompt), schema: hash(schemaBytes), glm_ocr: model };
  return {
    versions,
    async generate(image, signal) {
      // Metadata/transport failure is infrastructure, not a model attempt failure.
      const tagsResponse = await fetch(new URL("api/tags", url), { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]), redirect: "error" });
      if (!tagsResponse.ok) throw new Error("ollama_unavailable");
      const tags = await tagsResponse.json() as { models?: { name: string; model: string; digest: string; details?: { quantization_level?: string } }[] };
      const identity = tags.models?.find(item => item.name === model || item.name === `${model}:latest` || item.model === model);
      if (!identity || !/^(?:sha256:)?[a-f0-9]{64}$/.test(identity.digest) || identity.details?.quantization_level !== "Q4_K_M") throw new Error("ollama_q4_required");
      versions.glm_ocr = `${model}@${identity.digest};Q4_K_M`;
      const attemptModel = versions.glm_ocr;
      const inferenceTimeout = AbortSignal.timeout(config.timeoutMs ?? 120_000);
      const requestSignal = AbortSignal.any([signal, inferenceTimeout]);
      try {
        const response = await fetch(new URL("api/generate", url), {
          method: "POST", headers: { "Content-Type": "application/json" }, signal: requestSignal, redirect: "error",
          body: JSON.stringify({ model, prompt, format, images: [Buffer.from(image).toString("base64")], stream: false, think: false, keep_alive: 0,
            options: { temperature: 0, seed: 0, num_gpu: 0, num_thread: 2, num_ctx: 8192, num_predict: 4096 } }),
        });
        if (!response.ok || !response.body) throw new Error("ollama_unavailable");
        // Bound the envelope without repairing or mislabeling partial HTTP JSON as model text.
        const reader = response.body.getReader(); let size = 0; const chunks: Uint8Array[] = [];
        try {
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            size += value.length; if (size > 2 * 1024 * 1024) throw new ModelOutputLimit();
            chunks.push(value);
          }
        } finally { try { await reader.cancel(); } catch { /* Preserve the primary attempt outcome. */ } reader.releaseLock(); }
        const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!value || typeof value !== "object" || !("response" in value) || typeof value.response !== "string") throw new Error("ollama_unavailable");
        const complete = "done" in value && value.done === true && (!("done_reason" in value) || value.done_reason !== "length");
        return { raw: value.response, complete,
          model: `${"model" in value && typeof value.model === "string" ? value.model : model}@${identity.digest};Q4_K_M`,
          ...(!complete ? { reason: "output_token_limit" as const } : {}) };
      } catch (error) {
        // Whole-job cancellation still belongs to the infrastructure/queue boundary.
        if (signal.aborted) throw error;
        const reason = error instanceof ModelOutputLimit ? "ollama_output_limit" : inferenceTimeout.aborted ? "inference_timeout" : null;
        if (!reason) throw error;
        // No complete response string was decoded. Empty raw is honest; HTTP-envelope
        // fragments are not the literal model output and must not be invented/repaired.
        return { raw: "", complete: false, reason, model: attemptModel };
      }
    },
  };
}
