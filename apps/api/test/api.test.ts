import { afterAll, beforeAll, expect, it } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { eq, sql } from "drizzle-orm";
import { createApp, CONSENT_VERSION } from "../src/app.js";
import { connect, migrateDatabase } from "../src/db/database.js";
import { datasetRecords, jobs, modelAttempts, ticketArtifacts, tickets } from "../src/db/schema.js";
import { ContentFailure, type OcrBridge } from "../src/ingestion/bridge.js";
import { createOllamaExtractor, type Extractor } from "../src/ingestion/ollama.js";
import { createQueueWorker } from "../src/ingestion/queue.js";
import { eraseTicket, purgeExpired } from "../src/ingestion/retention.js";
import { localMediaStorage } from "../src/storage/media.js";
import { syntheticEvidence, syntheticTicket } from "./synthetic.js";

let container: StartedPostgreSqlContainer, directory: string, connection: ReturnType<typeof connect>;
let app: ReturnType<typeof createApp>, extractor: Extractor, server: Server;
let png: Buffer, sequence = 0, mode = "valid", failure: string | null = null, hold: Promise<void> | null = null;
const calls: Record<string, unknown>[] = [];
const base = syntheticEvidence();
const bridge: OcrBridge = {
  async prepare(bytes, signal) {
    if (failure === "content") throw new ContentFailure("imagen_ilegible");
    if (failure === "infra") throw new Error("synthetic_sensitive_exception");
    if (failure === "timeout") await new Promise(() => {});
    if (hold) await hold;
    return base.prepare(bytes, signal);
  },
  async extract(bytes, signal) { const result = await base.extract(bytes, signal); return mode === "no_text" ? { ...result, lines: [] } : result; },
  async close() {},
};
const key = new TextEncoder().encode("synthetic-test-key-not-a-secret-value");
let storage: ReturnType<typeof localMediaStorage>;
const worker = (timeout = 5000) => createQueueWorker({ db: connection.db, storage, bridge, extractor, hmacKey: key, jobTimeoutMs: timeout,
  sampleOllamaRam: async () => 2000 });
const get = async (path: string) => (await app.request(`/v1${path}`)).json();
async function upload(options: { bytes?: Uint8Array; country?: string; consent?: boolean } = {}) {
  const bytes = options.bytes ?? Buffer.concat([png, Buffer.from(`synthetic-${sequence++}`)]);
  const form = new FormData(); form.set("image", new File([new Uint8Array(bytes)], "synthetic.png", { type: "image/png" }));
  form.set("country", options.country ?? "AR"); form.set("synthetic", "true");
  if (options.consent !== false) { form.set("consent", "true"); form.set("consentVersion", CONSENT_VERSION); }
  return app.request("/v1/contributions", { method: "POST", body: form });
}
beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16.13-alpine").start();
  directory = await mkdtemp(join(tmpdir(), "tuki-t8-api-test-")); console.info(`SCRATCH_RETAINED=${directory}`);
  png = await readFile(new URL("../../contributor-web/public/samples/legible.png", import.meta.url));
  connection = connect(container.getConnectionUri()); await migrateDatabase(connection.db); storage = localMediaStorage(directory);
  server = createServer(async (req, res) => {
    if (req.url === "/api/tags") return res.end(JSON.stringify({ models: [{ name: "synthetic-q4", digest: "a".repeat(64), details: { quantization_level: "Q4_K_M" } }] }));
    let body = ""; for await (const chunk of req) body += chunk; calls.push(JSON.parse(body));
    const data = syntheticTicket(); if (mode === "empty") data.items[0]!.importe = "";
    const raw = mode === "invalid" ? "  invalid synthetic output\n" : JSON.stringify(data);
    res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ response: raw, model: "synthetic-q4", done: true }));
  });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  extractor = await createOllamaExtractor({ url: `http://127.0.0.1:${(server.address() as { port: number }).port}`, model: "synthetic-q4" });
  app = createApp({ db: connection.db, storage, versions: extractor.versions });
}, 120_000);
afterAll(async () => {
  if (server) { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  if (connection) await connection.client.end(); if (container) await container.stop();
  // Coordinator owns cleanup of the printed synthetic-only scratch directory.
});

it("enqueues an immutable original and persists accepted result, artifacts and separate dataset", async () => {
  const bytes = Buffer.concat([png, Buffer.from("synthetic-original")]);
  const response = await upload({ bytes }); expect(response.status).toBe(202);
  const queued = await response.json(); expect(queued.state).toBeNull(); expect(queued.job.status).toBe("pending"); expect(queued.result).toBeNull(); expect(queued.job.attempts).toBe(0);
  expect(await worker().runNext()).toBe(true); const result = await get(`/contributions/${queued.id}`);
  expect(result.state).toBe("accepted"); expect(result.label).toBe("Aceptado"); expect(result.job.status).toBe("succeeded"); expect(result.result.puntaje).toBeGreaterThanOrEqual(.85);
  const [artifact] = await connection.db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, queued.id));
  expect(Buffer.from(await storage.read(artifact!.originalKey!))).toEqual(bytes); expect(artifact!.geometry?.toOriginal).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]); expect(artifact!.lines).toHaveLength(8);
  expect((await connection.db.select().from(modelAttempts).where(eq(modelAttempts.ticketId, queued.id)))[0]?.raw).toBe(JSON.stringify(syntheticTicket()));
  expect((await connection.db.select().from(datasetRecords).where(eq(datasetRecords.ticketId, queued.id)))[0]?.record.ticket_id).toBe(queued.id);
  expect(result.versions.glm_ocr).toContain("a".repeat(64)); expect(result.versions.prompt).toMatch(/^sha256:/);
  expect(result.metrics.memory.complete).toBe(true); expect(result.metrics.peakRamBytes).toBeGreaterThan(3000);
  expect(Object.keys(result.metrics.stages)).toEqual(expect.arrayContaining(["E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E6_E9", "total"]));
  expect((await app.request(`/v1/contributions/${queued.id}/image`)).status).toBe(200); expect((await app.request(`/v1/contributions/${queued.id}`)).headers.get("cache-control")).toBe("no-store");
  const repeated = await upload({ bytes }); expect(repeated.status).toBe(200); expect((await repeated.json()).id).toBe(queued.id); expect(await worker().runNext()).toBe(false);
});

it("requires consent and country before enqueueing, and rejects unsupported countries without models", async () => {
  expect((await upload({ consent: false })).status).toBe(422); expect((await upload({ country: "ar" })).status).toBe(422);
  const before = calls.length; const response = await upload({ country: "ZZ" }); expect(response.status).toBe(202);
  const result = await response.json(); expect(result.state).toBe("processing_error"); expect(result.errorCode).toBe("pais_no_soportado"); expect(result.job.attempts).toBe(0);
  expect(result.job.status).toBe("failed"); expect(await worker().runNext()).toBe(false); expect(calls.length).toBe(before);
});

it("rejects empty model item amounts without filling them or emitting a dataset", async () => {
  mode = "empty"; const { id } = await (await upload()).json(); await worker().runNext(); mode = "valid";
  const result = await get(`/contributions/${id}`); expect(result.state).toBe("rejected"); expect(result.label).toBe("Rechazado");
  expect(result.result.items[0].importe).toMatchObject({ raw: "", valor: null, estado: "faltante" });
  expect(result.result.validaciones.find((v: { id: string }) => v.id === "V4").resultado).toBe("falla");
  expect(await connection.db.select().from(datasetRecords).where(eq(datasetRecords.ticketId, id))).toEqual([]);
});

it("retries infrastructure failures twice then persists error_interno without exception text", async () => {
  failure = "infra"; const { id } = await (await upload()).json(); const runner = worker();
  for (let attempt = 1; attempt <= 3; attempt++) {
    expect(await runner.runNext()).toBe(true); const result = await get(`/contributions/${id}`);
    expect(result.job.attempts).toBe(attempt); expect(result.job.status).toBe(attempt < 3 ? "pending" : "failed");
    expect(result.state).toBe(attempt < 3 ? null : "processing_error"); expect(JSON.stringify(result)).not.toContain("sensitive");
  }
  failure = null; const result = await get(`/contributions/${id}`); expect(result.result.motivo).toBe("error_interno"); expect(result.result.puntaje).toBeNull(); expect(await runner.runNext()).toBe(false);
});

it("never retries content failures or executes E5 after empty OCR", async () => {
  const before = calls.length; failure = "content"; const { id } = await (await upload()).json(); await worker().runNext(); failure = null;
  expect((await get(`/contributions/${id}`)).job).toMatchObject({ attempts: 1, status: "failed" }); expect((await get(`/contributions/${id}`)).errorCode).toBe("imagen_ilegible");
  mode = "no_text"; const empty = await (await upload()).json(); await worker().runNext(); mode = "valid";
  expect((await get(`/contributions/${empty.id}`)).errorCode).toBe("texto_ilegible"); expect(calls.length).toBe(before);
});

it("persists both invalid raw responses unchanged without queue retry", async () => {
  mode = "invalid"; const { id } = await (await upload()).json(); const before = calls.length; await worker().runNext(); mode = "valid";
  const result = await get(`/contributions/${id}`); expect(result.errorCode).toBe("extraccion_invalida"); expect(result.job.attempts).toBe(1); expect(calls.length - before).toBe(2);
  const attempts = await connection.db.select().from(modelAttempts).where(eq(modelAttempts.ticketId, id));
  expect(attempts.map(row => row.raw)).toEqual(["  invalid synthetic output\n", "  invalid synthetic output\n"]); expect(result.ocr).toHaveLength(8);
  expect(await connection.db.select().from(datasetRecords).where(eq(datasetRecords.ticketId, id))).toEqual([]);
});

it("times out hung jobs and exhausts exactly three queue attempts", async () => {
  failure = "timeout"; const { id } = await (await upload()).json(); const runner = worker(20);
  for (let attempt = 1; attempt <= 3; attempt++) expect(await runner.runNext()).toBe(true);
  failure = null; const result = await get(`/contributions/${id}`); expect(result.job).toMatchObject({ attempts: 3, status: "failed" }); expect(result.errorCode).toBe("error_interno");
});

it("claims another row with SKIP LOCKED rather than waiting on the first", async () => {
  const first = await (await upload()).json(), second = await (await upload()).json(); let release!: () => void, ready!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), locked = new Promise<void>(resolve => { ready = resolve; });
  const blocker = connection.db.transaction(async tx => { await tx.select().from(jobs).where(eq(jobs.ticketId, first.id)).for("update"); ready(); await gate; });
  await locked;
  try { expect(await worker().runNext()).toBe(true); expect((await get(`/contributions/${second.id}`)).state).toBe("accepted"); expect((await get(`/contributions/${first.id}`)).job.status).toBe("pending"); }
  finally { release(); await blocker; }
  await worker().runNext();
});

it("enforces one worker across instances and exposes running status", async () => {
  const { id } = await (await upload()).json(); let release!: () => void;
  hold = new Promise<void>(resolve => { release = resolve; }); const runner = worker(), processing = runner.runNext();
  await expect.poll(async () => (await get(`/contributions/${id}`)).job.status).toBe("running");
  const next = await (await upload()).json(); expect(next.job.status).toBe("pending");
  expect(await runner.runNext()).toBe(false); expect(await worker().runNext()).toBe(false);
  release(); hold = null; expect(await processing).toBe(true); expect((await get(`/contributions/${id}`)).state).toBe("accepted");
  expect(await worker().runNext()).toBe(true); expect((await get(`/contributions/${next.id}`)).state).toBe("accepted");
});

it("deduplicates simultaneous uploads of the exact original into one job", async () => {
  const bytes = Buffer.concat([png, Buffer.from("synthetic-racing-original")]);
  const responses = await Promise.all([upload({ bytes }), upload({ bytes })]);
  expect(responses.map(response => response.status).sort()).toEqual([200, 202]);
  const first = await responses[0]!.json(), second = await responses[1]!.json(); expect(first.id).toBe(second.id);
  expect(await connection.db.select().from(jobs).where(eq(jobs.ticketId, first.id))).toHaveLength(1);
  expect(await worker().runNext()).toBe(true); expect(await worker().runNext()).toBe(false);
});

it("recovers a crashed running row without exceeding its retry budget", async () => {
  const { id } = await (await upload()).json();
  await connection.db.update(jobs).set({ status: "running", attempts: 2, token: "synthetic-crashed-owner", deadline: new Date(0) }).where(eq(jobs.ticketId, id));
  expect(await worker().runNext()).toBe(true); expect((await get(`/contributions/${id}`)).job.attempts).toBe(3); expect((await get(`/contributions/${id}`)).state).toBe("accepted");
});

it("purges buyer-bearing copies at 30 days while retaining hashes, score and dataset", async () => {
  const { id } = await (await upload()).json(); await worker().runNext(); const before = await get(`/contributions/${id}`);
  await connection.db.update(tickets).set({ processedAt: new Date("2026-01-01T00:00:00Z") }).where(eq(tickets.id, id));
  const [artifact] = await connection.db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, id));
  const reference = new Date("2026-02-01T00:00:00Z"); expect(await purgeExpired(connection.db, storage, reference)).toBe(1); expect(await purgeExpired(connection.db, storage, reference)).toBe(0);
  const result = await get(`/contributions/${id}`); expect(result.result.puntaje).toBe(before.result.puntaje); expect(result.result.subpuntajes).toEqual(before.result.subpuntajes);
  expect(result.result.campos).toEqual({}); expect(result.result.items).toEqual([]); expect(result.result.texto_no_interpretado).toEqual([]);
  expect(result.result.metadatos.id_fiscal).toBeNull(); expect(result.result.metadatos.qr).toBeNull(); expect(result.ocr).toBeNull(); expect(result.geometry).toBeNull();
  expect(await connection.db.select().from(modelAttempts).where(eq(modelAttempts.ticketId, id))).toEqual([]); expect(await connection.db.select().from(datasetRecords).where(eq(datasetRecords.ticketId, id))).toHaveLength(1);
  await expect(storage.read(artifact!.originalKey!)).rejects.toThrow(); await expect(storage.read(artifact!.preprocessedKey!)).rejects.toThrow();
  expect((await connection.db.select().from(tickets).where(eq(tickets.id, id)))[0]?.sha256).toHaveLength(64);
});

it("restricts dataset-reader privileges to the separate dataset table", async () => {
  const session = await connection.client.reserve();
  try {
    await session`SET ROLE tuki_dataset_reader`; expect((await session`SELECT count(*) FROM dataset_records`).length).toBe(1);
    for (const table of ["tickets", "jobs", "ticket_artifacts", "model_attempts", "job_runs", "observations", "reviews"])
      await expect(session.unsafe(`SELECT * FROM ${table} LIMIT 1`)).rejects.toMatchObject({ code: "42501" });
  } finally { await session`RESET ROLE`; session.release(); }
});

it("erases internal and dataset records without introducing public editing endpoints", async () => {
  const { id } = await (await upload()).json(); await worker().runNext(); expect(await eraseTicket(connection.db, storage, id)).toBe(true);
  expect((await app.request(`/v1/contributions/${id}`)).status).toBe(404); expect(await connection.db.select().from(datasetRecords).where(eq(datasetRecords.ticketId, id))).toEqual([]);
  for (const [method, suffix] of [["PUT", "review"], ["POST", "complete-review"], ["POST", "retry"]] as const) expect((await app.request(`/v1/contributions/${id}/${suffix}`, { method })).status).toBe(404);
});

it("keeps newest-first history and actual counters using only final ticket states", async () => {
  const history = await get("/contributions"), dashboard = await get("/dashboard"); expect(dashboard.total).toBe(history.records.length);
  expect(history.records.map((row: { createdAt: string }) => row.createdAt)).toEqual(history.records.map((row: { createdAt: string }) => row.createdAt).sort().reverse());
  expect((await get("/contributions?state=accepted")).records.every((row: { state: string }) => row.state === "accepted")).toBe(true);
  expect((await app.request("/v1/contributions?state=needs_review")).status).toBe(400); expect((await app.request("/v1/health")).status).toBe(200);
  expect((await get("/consent")).text).toContain("cannot be recalled"); expect((await readdir(directory)).every(file => /^[a-f0-9]{64}\.(?:original|png)$/.test(file))).toBe(true);
});

it("rejects cross-origin writes and malformed uploads with stable codes", async () => {
  expect((await app.request("/v1/contributions", { method: "POST", headers: { Origin: "https://attacker.invalid" } })).status).toBe(403);
  const form = new FormData(); form.set("image", new File(["synthetic"], "synthetic.txt", { type: "text/plain" }));
  expect(await (await app.request("/v1/contributions", { method: "POST", body: form })).json()).toEqual({ code: "archivo_invalido" });
  expect((await app.request("/v1/contributions/not-an-id")).status).toBe(404); expect((await app.request("/v1/contributions", { method: "POST" })).status).toBe(400);
  const rows = await connection.db.execute(sql`SELECT count(*)::int AS count FROM tickets WHERE state IS NULL AND processed_at IS NOT NULL`); expect(rows[0]?.count).toBe(0);
});
