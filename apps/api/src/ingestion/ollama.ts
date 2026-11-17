import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

export type ExtractionAttempt = { raw: string; complete: boolean; model: string };
export type Extractor = {
  versions: { prompt: string; schema: string; glm_ocr: string };
  generate(image: Uint8Array, signal: AbortSignal): Promise<ExtractionAttempt>;
};

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
      const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(config.timeoutMs ?? 120_000)]);
      const tagsResponse = await fetch(new URL("api/tags", url), { signal: requestSignal, redirect: "error" });
      if (!tagsResponse.ok) throw new Error("ollama_unavailable");
      const tags = await tagsResponse.json() as { models?: { name: string; model: string; digest: string; details?: { quantization_level?: string } }[] };
      const identity = tags.models?.find(item => item.name === model || item.name === `${model}:latest` || item.model === model);
      if (!identity || !/^(?:sha256:)?[a-f0-9]{64}$/.test(identity.digest) || identity.details?.quantization_level !== "Q4_K_M") throw new Error("ollama_q4_required");
      versions.glm_ocr = `${model}@${identity.digest};Q4_K_M`;
      const response = await fetch(new URL("api/generate", url), {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: requestSignal, redirect: "error",
        body: JSON.stringify({ model, prompt, format, images: [Buffer.from(image).toString("base64")], stream: false, think: false, keep_alive: 0,
          options: { temperature: 0, seed: 0, num_gpu: 0, num_thread: 2, num_ctx: 8192, num_predict: 4096 } }),
      });
      if (!response.ok || !response.body) throw new Error("ollama_unavailable");
      // Bound the HTTP envelope, without changing the literal model response.
      const reader = response.body.getReader(); let size = 0; const chunks: Uint8Array[] = [];
      try {
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          size += value.length; if (size > 2 * 1024 * 1024) throw new Error("ollama_output_limit");
          chunks.push(value);
        }
      } finally { await reader.cancel(); reader.releaseLock(); }
      const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (!value || typeof value !== "object" || !("response" in value) || typeof value.response !== "string") throw new Error("ollama_unavailable");
      return { raw: value.response, complete: "done" in value && value.done === true && (!("done_reason" in value) || value.done_reason !== "length"),
        model: `${"model" in value && typeof value.model === "string" ? value.model : model}@${identity.digest};Q4_K_M` };
    },
  };
}
