import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { createApp } from "./app.js";
import { connect } from "./db/database.js";
import { createPythonBridge } from "./ingestion/bridge.js";
import { createOllamaExtractor } from "./ingestion/ollama.js";
import { createQueueWorker } from "./ingestion/queue.js";
import { purgeExpired } from "./ingestion/retention.js";
import { createOllamaMemorySampler } from "./ingestion/memory.js";
import { DEFAULT_GLM_TIMEOUT_MS, DEFAULT_OCR_TIMEOUT_MS, resolveJobTimeoutMs } from "./ingestion/timeouts.js";
import { localMediaStorage } from "./storage/media.js";
import { outsideRepositoryStorage } from "./storage/directory.js";

const { DATABASE_URL, STORAGE_DIR, OCR_PYTHON, OCR_MODELS_DIR, OCR_CACHE_DIR, DATASET_HMAC_KEY } = process.env;
if (!DATABASE_URL || !STORAGE_DIR || !OCR_PYTHON || !OCR_MODELS_DIR || !OCR_CACHE_DIR || !DATASET_HMAC_KEY || Buffer.byteLength(DATASET_HMAC_KEY) < 32) {
  process.stderr.write("configuration_missing\n"); process.exit(1);
}
const root = fileURLToPath(new URL("../../../", import.meta.url));
let directory: string;
try { directory = await outsideRepositoryStorage(root, STORAGE_DIR); }
catch { process.stderr.write("storage_outside_repository_required\n"); process.exit(1); }
const positive = (key: string, fallback: number) => {
  const value = process.env[key]; if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || Number(value) <= 0 || !Number.isSafeInteger(Number(value))) {
    process.stderr.write("configuration_invalid\n"); process.exit(1);
  }
  return Number(value);
};
const ocrConfidence = process.env.OCR_MIN_CONFIDENCE === undefined ? .6 : Number(process.env.OCR_MIN_CONFIDENCE);
if (!Number.isFinite(ocrConfidence) || ocrConfidence < 0 || ocrConfidence > 1) {
  process.stderr.write("configuration_invalid\n"); process.exit(1);
}
const glmTimeoutMs = positive("GLM_TIMEOUT_MS", DEFAULT_GLM_TIMEOUT_MS), preparationTimeoutMs = positive("OCR_TIMEOUT_MS", DEFAULT_OCR_TIMEOUT_MS);
let jobTimeoutMs: number;
try { jobTimeoutMs = resolveJobTimeoutMs(glmTimeoutMs, preparationTimeoutMs, process.env.JOB_TIMEOUT_MS === undefined ? undefined : positive("JOB_TIMEOUT_MS", 0)); }
catch { process.stderr.write("configuration_invalid\n"); process.exit(1); }
const { db, client } = connect(DATABASE_URL);
const storage = localMediaStorage(directory);
const minSide = positive("OCR_MIN_SIDE", 600), minSharpness = positive("OCR_MIN_SHARPNESS", 100);
const bridge = createPythonBridge({ python: OCR_PYTHON, modelsDir: OCR_MODELS_DIR, cacheDir: OCR_CACHE_DIR,
  minSide, minSharpness });
let extractor;
try { extractor = await createOllamaExtractor({ ...(process.env.OLLAMA_URL ? { url: process.env.OLLAMA_URL } : {}),
  ...(process.env.GLM_OCR_MODEL ? { model: process.env.GLM_OCR_MODEL } : {}), timeoutMs: glmTimeoutMs }); }
catch { process.stderr.write("configuration_invalid\n"); await client.end(); process.exit(1); }
const stopping = new AbortController();
const worker = createQueueWorker({ db, storage, bridge, extractor, hmacKey: Buffer.from(DATASET_HMAC_KEY),
  jobTimeoutMs, preparationTimeoutMs, signal: stopping.signal,
  minOcrConfidence: ocrConfidence,
  ...(process.env.OLLAMA_PID ? { sampleOllamaRam: createOllamaMemorySampler(positive("OLLAMA_PID", 0)) } : {}) });
const app = createApp({ db, storage, versions: { ...extractor.versions, screening: { minSide, minSharpness, minOcrConfidence: ocrConfidence }, preprocessing: "opencv-perspective-exif-v1" } });
const server = serve({ fetch: app.fetch, hostname: "127.0.0.1", port: 8787 });
const loop = (async () => {
  let lastPurge = 0;
  while (!stopping.signal.aborted) {
    try {
      if (Date.now() - lastPurge >= 3_600_000) { await purgeExpired(db, storage); lastPurge = Date.now(); }
      if (await worker.runNext()) continue;
    } catch { process.stderr.write("worker_unavailable\n"); }
    try { await delay(1000, undefined, { signal: stopping.signal }); } catch { break; }
  }
})();
const shutdown = async () => {
  if (stopping.signal.aborted) return; stopping.abort();
  await new Promise<void>(resolve => server.close(() => resolve()));
  await loop; await bridge.close(); await client.end();
};
process.once("SIGINT", () => { void shutdown(); });
process.once("SIGTERM", () => { void shutdown(); });
