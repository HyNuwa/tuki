import { expect, it } from "vitest";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { createOllamaExtractor } from "../src/ingestion/ollama.js";

it("sends only the image and exact versioned prompt/schema to local CPU Ollama", async () => {
  const requests: unknown[] = [];
  const server = createServer(async (req, res) => {
    if (req.url === "/api/tags") return res.end(JSON.stringify({ models: [{ name: "synthetic-q4", digest: "a".repeat(64), details: { quantization_level: "Q4_K_M" } }] }));
    let body = ""; for await (const chunk of req) body += chunk;
    requests.push(JSON.parse(body));
    expect(req.url).toBe("/api/generate");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ response: "  {invalid synthetic output}\n", done: true }));
  });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const port = (server.address() as { port: number }).port;
  try {
    const extractor = await createOllamaExtractor({ url: `http://127.0.0.1:${port}`, model: "synthetic-q4" });
    const result = await extractor.generate(new Uint8Array([1, 2]), AbortSignal.timeout(2000));
    expect(result.raw).toBe("  {invalid synthetic output}\n");
    expect(requests).toEqual([{
      model: "synthetic-q4", stream: false, think: false, keep_alive: 0,
      prompt: await readFile(new URL("../../../spikes/ticket-pipeline/prompt-ticket-v1.txt", import.meta.url), "utf8"),
      format: JSON.parse(await readFile(new URL("../../../spikes/ticket-pipeline/ticket-v1-format.schema.json", import.meta.url), "utf8")),
      images: ["AQI="], options: { temperature: 0, seed: 0, num_gpu: 0, num_thread: 2, num_ctx: 8192, num_predict: 4096 },
    }]);
    expect(extractor.versions.prompt).toMatch(/^sha256:[a-f0-9]{64}$/);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});

it("rejects remote Ollama configuration before making a network request", async () => {
  await expect(createOllamaExtractor({ url: "https://remote.invalid", model: "synthetic" })).rejects.toThrow("ollama_local_required");
});
