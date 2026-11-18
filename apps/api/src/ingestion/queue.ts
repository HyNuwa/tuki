import { createHash, randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { logicalTicket, processingError, type LogicalTicket, type PipelineConfig, type PipelineResult, type ProcessingError } from "@tuki/domain";
import type { Database } from "../db/database.js";
import { datasetRecords, jobRuns, jobs, modelAttempts, ticketArtifacts, tickets, type Metrics } from "../db/schema.js";
import type { MediaStorage } from "../storage/media.js";
import type { OcrBridge } from "./bridge.js";
import type { Extractor } from "./ollama.js";
import { executeTicket, type PipelineArtifacts } from "./pipeline.js";
import { DEFAULT_JOB_TIMEOUT_MS } from "./timeouts.js";

export const QUEUE_LOCK = 1414875984;
export type QueueConfig = { db: Database; storage: MediaStorage; bridge: OcrBridge; extractor: Extractor; hmacKey: Uint8Array;
  jobTimeoutMs?: number; preparationTimeoutMs?: number; minOcrConfidence?: number; pipelineConfig?: PipelineConfig; signal?: AbortSignal; sampleOllamaRam?: () => Promise<number | null> };
export const emptyMetrics = (): Metrics => ({ stages: {}, peakRamBytes: null, memory: { node: process.memoryUsage().rss, ocr: null, ollama: null, complete: false } });

/** Session advisory lock enforces one worker across API processes; row claim skips locks. */
export function createQueueWorker(config: QueueConfig) {
  const { db, storage, bridge, extractor } = config;
  let busy = false;
  return {
    async runNext(): Promise<boolean> {
      if (busy) return false; busy = true;
      let session: Awaited<ReturnType<Database["$client"]["reserve"]>> | undefined;
      let locked = false;
      try {
        session = await db.$client.reserve();
        const lock = await session`SELECT pg_try_advisory_lock(${QUEUE_LOCK}) AS acquired`;
        if (!lock[0]?.acquired) return false;
        locked = true;
        // Owning the session lock proves no other cooperating worker is active.
        // A former owner that crashed cannot strand a running row indefinitely.
        const abandoned = await db.select().from(jobs).where(eq(jobs.status, "running"));
        for (const job of abandoned) {
          await db.transaction(async tx => {
            const [previousTicket] = await tx.select().from(tickets).where(eq(tickets.id, job.ticketId));
            await tx.insert(jobRuns).values({ id: randomUUID(), ticketId: job.ticketId, attempt: job.attempts, metrics: previousTicket!.metrics, outcome: "crash_recovered" });
            await tx.update(jobs).set({ status: job.attempts < 3 ? "pending" : "failed", token: null, deadline: null }).where(eq(jobs.id, job.id));
            if (job.attempts >= 3) await tx.update(tickets).set({ state: "processing_error", errorCode: "error_interno",
              result: processingError(job.ticketId, previousTicket!.country, "error_interno"), processedAt: new Date() }).where(eq(tickets.id, job.ticketId));
          });
        }
        const claimed = await db.transaction(async tx => {
          const [job] = await tx.select().from(jobs).where(and(eq(jobs.status, "pending"), sql`${jobs.attempts} < 3`))
            .orderBy(jobs.createdAt, jobs.id).limit(1).for("update", { skipLocked: true });
          if (!job) return null;
          const [updated] = await tx.update(jobs).set({ status: "running", attempts: job.attempts + 1, token: randomUUID(),
            deadline: new Date(Date.now() + (config.jobTimeoutMs ?? DEFAULT_JOB_TIMEOUT_MS)) }).where(eq(jobs.id, job.id)).returning();
          return updated!;
        });
        if (!claimed) return false;
        const [ticket] = await db.select().from(tickets).where(eq(tickets.id, claimed.ticketId));
        if (!ticket) throw new Error("ticket_missing");
        const metrics = emptyMetrics(); metrics.stages.E0 = ticket.metrics.stages.E0 ?? 0;
        const signal = AbortSignal.any([AbortSignal.timeout(config.jobTimeoutMs ?? DEFAULT_JOB_TIMEOUT_MS), ...(config.signal ? [config.signal] : [])]);
        let sampling = false;
        const sampleMemory = async () => {
          if (sampling) return; sampling = true;
          try {
            metrics.memory.node = Math.max(metrics.memory.node, process.memoryUsage().rss);
            const ollama = await config.sampleOllamaRam?.();
            if (ollama != null) metrics.memory.ollama = Math.max(metrics.memory.ollama ?? 0, ollama);
            metrics.memory.complete = metrics.memory.ollama !== null && metrics.memory.ocr !== null;
            metrics.peakRamBytes = metrics.memory.complete ? metrics.memory.node + metrics.memory.ocr! + metrics.memory.ollama! : null;
          } catch { metrics.memory.complete = false; metrics.peakRamBytes = null; }
          finally { sampling = false; }
        };
        const sample = setInterval(() => { void sampleMemory(); }, 100);
        const own = async () => {
          signal.throwIfAborted();
          const rows = await db.select({ token: jobs.token }).from(jobs).where(eq(jobs.id, claimed.id));
          if (rows[0]?.token !== claimed.token) throw new Error("job_lease_lost");
          // Check the held connection too: losing it must fence further persistence.
          await session!`SELECT 1`;
          signal.throwIfAborted();
        };
        let visualDuplicate = false;
        const persist = async (artifact: PipelineArtifacts) => {
          await own();
          if (artifact.stage === "E2") {
            const prepared = artifact.prepared, key = `${createHash("sha256").update(prepared.image).digest("hex")}.png`;
            await storage.put(key, prepared.image); await own();
            await db.update(ticketArtifacts).set({ preprocessedKey: key, geometry: prepared.geometry }).where(eq(ticketArtifacts.ticketId, ticket.id));
            visualDuplicate = (await db.select({ id: tickets.id }).from(tickets).where(and(eq(tickets.perceptualHash, prepared.perceptualHash), sql`${tickets.id} <> ${ticket.id}`)).limit(1)).length > 0;
            await db.update(tickets).set({ perceptualHash: prepared.perceptualHash }).where(eq(tickets.id, ticket.id));
            Object.assign(metrics.stages, prepared.durations);
            metrics.memory.ocr = Math.max(metrics.memory.ocr ?? 0, prepared.peakRamBytes ?? 0) || null;
          } else if (artifact.stage === "E4") {
            await db.update(ticketArtifacts).set({ lines: artifact.evidence.lines }).where(eq(ticketArtifacts.ticketId, ticket.id));
            metrics.stages.E4 = artifact.durationMs;
            metrics.memory.ocr = Math.max(metrics.memory.ocr ?? 0, artifact.evidence.peakRamBytes ?? 0) || null;
            await db.update(tickets).set({ versions: { ...ticket.versions, pp_ocr: artifact.evidence.modelVersion } }).where(eq(tickets.id, ticket.id));
          } else if (artifact.stage === "E5") {
            const [current] = await db.select({ versions: tickets.versions }).from(tickets).where(eq(tickets.id, ticket.id));
            await db.insert(modelAttempts).values({ id: randomUUID(), ticketId: ticket.id, jobAttempt: claimed.attempts, modelAttempt: artifact.attempt,
              raw: artifact.raw, complete: artifact.complete, reason: artifact.reason, model: artifact.model, durationMs: Math.round(artifact.durationMs), versions: { ...current!.versions, ...extractor.versions } });
            metrics.stages.E5 = (metrics.stages.E5 ?? 0) + artifact.durationMs;
            await db.update(tickets).set({ versions: sql`${tickets.versions} || ${JSON.stringify(extractor.versions)}::jsonb` }).where(eq(tickets.id, ticket.id));
          } else { metrics.stages.E6_E9 = artifact.durationMs; Object.assign(metrics.stages, artifact.durations); }
          await sampleMemory(); await db.update(tickets).set({ metrics }).where(eq(tickets.id, ticket.id));
        };
        const started = performance.now();
        try {
          const [media] = await db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, ticket.id));
          if (!media?.originalKey) throw new Error("original_missing");
          // Fetch only compact domain-created duplicate metadata, never prior OCR/results.
          const existingTickets: LogicalTicket[] = (await db.select({ logical: tickets.logical }).from(tickets).where(and(sql`${tickets.id} <> ${ticket.id}`, sql`${tickets.logical} IS NOT NULL`)))
            .flatMap(row => row.logical ? [row.logical] : []);
          const processing = executeTicket({ ticketId: ticket.id, country: ticket.country, image: await storage.read(media.originalKey),
            today: ticket.createdAt.toISOString().slice(0, 10), hmacKey: config.hmacKey, bridge, extractor, signal, persist, existingTickets,
            ...(config.minOcrConfidence === undefined ? {} : { minOcrConfidence: config.minOcrConfidence }),
            ...(config.preparationTimeoutMs === undefined ? {} : { preparationTimeoutMs: config.preparationTimeoutMs }),
            ...(config.pipelineConfig ? { config: config.pipelineConfig } : {}),
          });
          const result = await Promise.race([processing, new Promise<never>((_, reject) => signal.addEventListener("abort", () => reject(new Error("job_timeout")), { once: true }))]);
          await own();
          if (visualDuplicate && "marcas" in result) {
            result.marcas = [...new Set([...result.marcas, "posible_duplicado"])];
            if (result.dataset) result.dataset.marcas = [...result.marcas];
          }
          metrics.stages.total = performance.now() - started;
          await sampleMemory();
          await finish(result);
        } catch {
          // Abort/kill the child before releasing the database-wide worker slot.
          await bridge.close();
          metrics.stages.total = performance.now() - started;
          if (claimed.attempts < 3) {
            await db.transaction(async tx => {
              await tx.insert(jobRuns).values({ id: randomUUID(), ticketId: ticket.id, attempt: claimed.attempts, metrics, outcome: "retry" });
              await tx.update(jobs).set({ status: "pending", token: null, deadline: null }).where(and(eq(jobs.id, claimed.id), eq(jobs.token, claimed.token!)));
            });
          } else await finish(processingError(ticket.id, ticket.country, "error_interno"));
        } finally { clearInterval(sample); }
        async function finish(result: PipelineResult | ProcessingError) {
          const { dataset, ...internal } = result;
          await db.transaction(async tx => {
            const [current] = await tx.select().from(jobs).where(eq(jobs.id, claimed!.id)).for("update");
            if (current?.token !== claimed!.token) throw new Error("job_lease_lost");
            await tx.update(tickets).set({ state: result.estado === "Aceptado" ? "accepted" : result.estado === "Rechazado" ? "rejected" : "processing_error",
              errorCode: result.estado === "Error de procesamiento" ? result.motivo : null, result: internal, metrics,
              logical: "campos" in result ? logicalTicket({ ...result, esquema: "ticket.v1", id_fiscal: result.metadatos.id_fiscal,
                cantidad_items: result.items.length, cantidad_impuestos: 0 }) : null,
              versions: sql`${tickets.versions} || ${JSON.stringify("versiones" in result ? result.versiones : {})}::jsonb`, processedAt: new Date() }).where(eq(tickets.id, ticket!.id));
            if (dataset) await tx.insert(datasetRecords).values({ ticketId: ticket!.id, record: dataset });
            await tx.insert(jobRuns).values({ id: randomUUID(), ticketId: ticket!.id, attempt: claimed!.attempts, metrics, outcome: result.estado });
            await tx.update(jobs).set({ status: result.estado === "Error de procesamiento" ? "failed" : "succeeded", token: null, deadline: null }).where(eq(jobs.id, claimed!.id));
          });
        }
        return true;
      } finally {
        try { if (locked && session) await session`SELECT pg_advisory_unlock(${QUEUE_LOCK})`; }
        finally { session?.release(); busy = false; }
      }
    },
  };
}
