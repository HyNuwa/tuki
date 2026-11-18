import { expect, it } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { executeTicket, type PipelineArtifacts } from "../src/ingestion/pipeline.js";
import { createOllamaExtractor } from "../src/ingestion/ollama.js";
import { syntheticEvidence } from "./synthetic.js";

it.each(["inference_timeout", "ollama_output_limit"])("persists two failed model attempts and returns a content failure for %s", async reason => {
  let generates = 0;
  const server = createServer(async (req, res) => {
    if (req.url === "/api/tags") return res.end(JSON.stringify({ models: [{ name: "synthetic-q4", digest: "a".repeat(64), details: { quantization_level: "Q4_K_M" } }] }));
    for await (const _chunk of req) { /* Consume only the invented image request. */ }
    generates++;
    res.setHeader("Content-Type", "application/json");
    if (reason === "inference_timeout") { res.flushHeaders(); return; }
    res.end(JSON.stringify({ response: "x".repeat(2 * 1024 * 1024), done: true }));
  });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const saved: PipelineArtifacts[] = [];
  try {
    const extractor = await createOllamaExtractor({ url: `http://127.0.0.1:${(server.address() as { port: number }).port}`, model: "synthetic-q4", timeoutMs: 300 });
    const result = await executeTicket({ ticketId: "synthetic", country: "AR", image: new Uint8Array([1]), today: "2026-11-17",
      hmacKey: new TextEncoder().encode("synthetic-test-key-not-a-secret"), bridge: syntheticEvidence(), extractor, signal: AbortSignal.timeout(5000),
      async persist(artifact) { saved.push(artifact); } });
    expect(result).toMatchObject({ estado: "Error de procesamiento", motivo: "extraccion_invalida", puntaje: null });
    expect(generates).toBe(2); expect(saved.map(artifact => artifact.stage)).toEqual(["E2", "E4", "E5", "E5"]);
    expect(saved.filter(artifact => artifact.stage === "E5")).toMatchObject([
      { attempt: 1, raw: "", complete: false, reason }, { attempt: 2, raw: "", complete: false, reason },
    ]);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});

it("keeps connection refusal as infrastructure failure without inventing a model attempt", async () => {
  const server = createServer(); server.listen(0, "127.0.0.1"); await once(server, "listening");
  const port = (server.address() as { port: number }).port;
  await new Promise<void>(resolve => server.close(() => resolve()));
  const extractor = await createOllamaExtractor({ url: `http://127.0.0.1:${port}`, model: "synthetic-q4", timeoutMs: 300 });
  const stages: string[] = [];
  await expect(executeTicket({ ticketId: "synthetic", country: "AR", image: new Uint8Array([1]), today: "2026-11-17",
    hmacKey: new TextEncoder().encode("synthetic-test-key-not-a-secret"), bridge: syntheticEvidence(), extractor, signal: AbortSignal.timeout(5000),
    async persist(artifact) { stages.push(artifact.stage); } })).rejects.toThrow();
  expect(stages).toEqual(["E2", "E4"]);
});
