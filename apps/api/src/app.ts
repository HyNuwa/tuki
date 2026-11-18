import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { createHash, randomUUID } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { countryModules, defaultPipelineConfig, isState, processingError, stateLabels } from "@tuki/domain";
import type { Database } from "./db/database.js";
import { jobs, ticketArtifacts, tickets } from "./db/schema.js";
import type { MediaStorage } from "./storage/media.js";
import { emptyMetrics } from "./ingestion/queue.js";

export const CONSENT_VERSION = "ticket-data-v1";
export const CONSENT_TEXT = "I consent to extracting the merchant, receipt, items, totals and payment method from my image and selling the privacy-filtered dataset to third-party agents. The original image, processed image, OCR and model output are retained for 30 days. I can request deletion of my ticket and dataset record; copies already purchased by third parties cannot be recalled.";
const validId = (id: string) => /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id);
type Dependencies = { db: Database; storage: MediaStorage; versions?: Record<string, unknown> };

/** Local, synthetic-only staging boundary. Authentication/ownership is a deployment gate. */
export function createApp({ db, storage, versions = {} }: Dependencies) {
  const app = new Hono();
  app.use("*", async (c, next) => {
    c.header("Cache-Control", "no-store"); c.header("X-Content-Type-Options", "nosniff");
    const origin = c.req.header("origin");
    if (origin && origin !== new URL(c.req.url).origin) return c.json({ code: "origin_forbidden" }, 403);
    await next();
  });
  app.use("*", bodyLimit({ maxSize: 5 * 1024 * 1024 + 64 * 1024, onError: c => c.json({ code: "upload_limit" }, 413) }));
  app.onError(() => new Response(JSON.stringify({ code: "error_interno" }), { status: 500,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }));
  app.notFound(c => c.json({ code: "not_found" }, 404));
  app.get("/v1/health", c => c.json({ status: "ok" }));
  app.get("/v1/consent", c => c.json({ version: CONSENT_VERSION, text: CONSENT_TEXT }));
  async function detail(id: string) {
    if (!validId(id)) return null;
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id)); if (!ticket) return null;
    const [job] = await db.select().from(jobs).where(eq(jobs.ticketId, id));
    const [artifact] = await db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, id));
    return { id: ticket.id, country: ticket.country, state: ticket.state, label: ticket.state ? stateLabels[ticket.state] : null,
      synthetic: ticket.synthetic, createdAt: ticket.createdAt, processedAt: ticket.processedAt, purgedAt: ticket.purgedAt,
      errorCode: ticket.errorCode, result: ticket.result, versions: ticket.versions, metrics: ticket.metrics,
      job: job ? { id: job.id, status: job.status, attempts: job.attempts } : null,
      ocr: artifact?.lines ?? null, geometry: artifact?.geometry ?? null, imageAvailable: !!artifact?.preprocessedKey };
  }
  app.post("/v1/contributions", async c => {
    const started = performance.now(); let form: FormData;
    try { form = await c.req.raw.formData(); } catch { return c.json({ code: "invalid_upload" }, 400); }
    const files = form.getAll("image"), image = files[0];
    if (files.length !== 1 || !(image instanceof File) || [...form.values()].filter(v => v instanceof File).length !== 1) return c.json({ code: "invalid_upload" }, 400);
    if (!["image/png", "image/jpeg", "image/webp"].includes(image.type)) return c.json({ code: "archivo_invalido" }, 415);
    if (!image.size || image.size > 5 * 1024 * 1024) return c.json({ code: "upload_limit" }, 413);
    const country = form.get("country");
    if (typeof country !== "string" || !/^[A-Z]{2}$/.test(country)) return c.json({ code: "country_required" }, 422);
    if (form.get("consent") !== "true" || form.get("consentVersion") !== CONSENT_VERSION) return c.json({ code: "consent_required" }, 422);
    const bytes = new Uint8Array(await image.arrayBuffer()), digest = createHash("sha256").update(bytes).digest("hex");
    const [previous] = await db.select({ id: tickets.id }).from(tickets).where(eq(tickets.sha256, digest));
    if (previous) return c.json(await detail(previous.id), 200);
    const id = randomUUID(), key = `${digest}.original`, now = new Date();
    const supported = Object.hasOwn(countryModules, country);
    const metrics = emptyMetrics(); metrics.stages.E0 = performance.now() - started;
    const result = await db.transaction(async tx => {
      // Coordinate unreferenced-object cleanup with uploads of the same digest.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`);
      const [inserted] = await tx.insert(tickets).values({ id, sha256: digest, country, synthetic: form.get("synthetic") === "true", consentVersion: CONSENT_VERSION, consentAt: now,
        state: supported ? null : "processing_error", errorCode: supported ? null : "pais_no_soportado", processedAt: supported ? null : now,
        result: supported ? null : processingError(id, country, "pais_no_soportado"),
        versions: { pipeline: "1.0.0", esquema: "ticket.v1", weights: defaultPipelineConfig, ...versions }, metrics,
      }).onConflictDoNothing({ target: tickets.sha256 }).returning({ id: tickets.id });
      if (!inserted) return { id: (await tx.select({ id: tickets.id }).from(tickets).where(eq(tickets.sha256, digest)))[0]!.id, created: false };
      await storage.put(key, bytes);
      metrics.stages.E0 = performance.now() - started;
      await tx.update(tickets).set({ metrics }).where(eq(tickets.id, id));
      await tx.insert(ticketArtifacts).values({ ticketId: id, originalKey: key });
      await tx.insert(jobs).values({ id: randomUUID(), ticketId: id, status: supported ? "pending" : "failed" });
      return { id, created: true };
    });
    return c.json(await detail(result.id), result.created ? 202 : 200);
  });
  app.get("/v1/contributions", async c => {
    const state = c.req.query("state"), status = c.req.query("jobStatus");
    if (state && !isState(state) || status && !["pending", "running", "succeeded", "failed"].includes(status)) return c.json({ code: "invalid_state" }, 400);
    const records = await db.select({ id: tickets.id, country: tickets.country, state: tickets.state, synthetic: tickets.synthetic,
      createdAt: tickets.createdAt, processedAt: tickets.processedAt, errorCode: tickets.errorCode, jobStatus: jobs.status })
      .from(tickets).innerJoin(jobs, eq(jobs.ticketId, tickets.id)).where(state && isState(state) ? eq(tickets.state, state) : undefined)
      .orderBy(desc(tickets.createdAt), desc(tickets.id));
    return c.json({ records: records.filter(row => !status || row.jobStatus === status).map(row => ({ ...row, label: row.state ? stateLabels[row.state] : null })) });
  });
  app.get("/v1/contributions/:id", async c => { const record = await detail(c.req.param("id")); return record ? c.json(record) : c.json({ code: "not_found" }, 404); });
  app.get("/v1/contributions/:id/result", async c => { const record = await detail(c.req.param("id")); return record ? c.json({ result: record.result, job: record.job }) : c.json({ code: "not_found" }, 404); });
  app.get("/v1/contributions/:id/image", async c => {
    const id = c.req.param("id"); if (!validId(id)) return c.json({ code: "not_found" }, 404);
    const [artifact] = await db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, id));
    if (!artifact?.preprocessedKey) return c.json({ code: "image_unavailable" }, 404);
    try { return c.body(new Uint8Array(await storage.read(artifact.preprocessedKey)), 200, { "Content-Type": "image/png" }); }
    catch { return c.json({ code: "image_unavailable" }, 404); }
  });
  app.get("/v1/dashboard", async c => {
    const rows = await db.select({ state: tickets.state, count: sql<number>`count(*)::int` }).from(tickets).groupBy(tickets.state);
    const queue = await db.select({ status: jobs.status, count: sql<number>`count(*)::int` }).from(jobs).groupBy(jobs.status);
    return c.json({ total: rows.reduce((sum, row) => sum + row.count, 0), counts: Object.fromEntries(rows.filter(row => row.state).map(row => [row.state, row.count])),
      jobs: Object.fromEntries(queue.map(row => [row.status, row.count])) });
  });
  return app;
}
