import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { arithmeticWarnings, createReview, isState, reviewProvenance, stateLabels, type ContributionState } from "@tuki/domain";
import type { Database } from "./db/database.js";
import { contributions, mediaRefs, observations, reviews, type Step } from "./db/schema.js";
import { bridgeCode, type OcrBridge } from "./ingestion/bridge.js";
import { validateReview } from "./contributor/review.js";
import type { MediaStorage } from "./storage/media.js";

type Dependencies = { db: Database; bridge: OcrBridge; storage: MediaStorage };
const step = (name: string): Step => ({ step: name, at: new Date().toISOString() });
const validId = (id: string) => /^[a-f0-9-]{36}$/.test(id);

export function createApp({ db, bridge, storage }: Dependencies) {
  const app = new Hono();
  app.use("*", async (c, next) => {
    c.header("Cache-Control", "no-store"); c.header("X-Content-Type-Options", "nosniff");
    const origin = c.req.header("origin");
    if (origin && origin !== new URL(c.req.url).origin) return c.json({ code: "origin_forbidden" }, 403);
    await next();
  });
  app.use("*", bodyLimit({ maxSize: 5 * 1024 * 1024 + 64 * 1024, onError: c => c.json({ code: "upload_limit" }, 413) }));
  app.onError(() => new Response(JSON.stringify({ code: "processing_failed" }), { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }));
  app.notFound(c => c.json({ code: "not_found" }, 404));
  app.get("/v1/health", c => c.json({ status: "ok" }));

  async function transition(id: string, state: ContributionState, errorCode: string | null = null) {
    await db.update(contributions).set({ state, errorCode, steps: sql`${contributions.steps} || ${JSON.stringify([step(state)])}::jsonb` }).where(eq(contributions.id, id));
  }
  async function detail(id: string) {
    if (!validId(id)) return null;
    const [record] = await db.select().from(contributions).where(eq(contributions.id, id));
    if (!record) return null;
    const [observation] = await db.select().from(observations).where(eq(observations.contributionId, id));
    const [saved] = await db.select().from(reviews).where(eq(reviews.contributionId, id));
    const [media] = await db.select().from(mediaRefs).where(eq(mediaRefs.contributionId, id));
    const initial = observation ? createReview(observation.draft) : null;
    const review = saved?.data ?? initial;
    return { id: record.id, state: record.state, synthetic: record.synthetic, createdAt: record.createdAt, errorCode: record.errorCode, steps: record.steps,
      draft: observation?.draft ?? null, ocr: observation?.ocr ?? null, review,
      provenance: saved?.provenance ?? (initial ? reviewProvenance(initial, initial) : {}),
      warnings: review ? arithmeticWarnings(review) : [],
      exif: media ? { hasCameraExif: media.hasCameraExif, softwareTagPresent: media.softwareTagPresent, captureTimeConsistent: media.captureTimeConsistent } : null };
  }
  async function processOcr(id: string, image: Uint8Array) {
    await transition(id, "processing");
    try {
      const { draft, ocr } = await bridge.extract(image);
      await db.insert(observations).values({ contributionId: id, draft, ocr });
      await transition(id, "extraction_ready");
      await transition(id, "needs_review");
    } catch (error) { await transition(id, "processing_error", bridgeCode(error)); }
  }

  app.post("/v1/contributions", async c => {
    let form: FormData;
    try { form = await c.req.raw.formData(); } catch { return c.json({ code: "invalid_upload" }, 400); }
    const files = form.getAll("image");
    const image = files[0];
    if (files.length !== 1 || !(image instanceof File) || [...form.values()].filter(v => v instanceof File).length !== 1) return c.json({ code: "invalid_upload" }, 400);
    if (!["image/png", "image/jpeg", "image/webp"].includes(image.type)) return c.json({ code: "unsupported_image" }, 415);
    if (!image.size || image.size > 5 * 1024 * 1024) return c.json({ code: "upload_limit" }, 413);
    let normalized;
    try { normalized = await bridge.normalize(new Uint8Array(await image.arrayBuffer())); }
    catch (error) {
      const code = bridgeCode(error);
      return c.json({ code }, code === "image_limit" || code === "upload_limit" ? 413 : code === "ocr_unavailable" ? 503 : 422);
    }
    const digest = createHash("sha256").update(normalized.image).digest("hex"), id = randomUUID();
    const key = `${digest}.png`;
    const inserted = await db.transaction(async tx => {
      const records = await tx.insert(contributions).values({ id, sha256: digest, synthetic: form.get("synthetic") === "true",
        steps: ["uploaded", "screening", "normalized", "dedupe"].map(step) }).onConflictDoNothing({ target: contributions.sha256 }).returning();
      if (!records.length) return false;
      await tx.insert(mediaRefs).values({ contributionId: id, digest, key, ...normalized.exif });
      return true;
    });
    if (!inserted) return c.json({ code: "duplicate" }, 409);
    try {
      await storage.put(key, normalized.image);
    } catch {
      await transition(id, "processing_error", "storage_unavailable");
      return c.json(await detail(id), 201);
    }
    await processOcr(id, normalized.image);
    return c.json(await detail(id), 201);
  });
  app.get("/v1/contributions", async c => {
    const state = c.req.query("state");
    if (state && !isState(state)) return c.json({ code: "invalid_state" }, 400);
    const records = await db.select({ id: contributions.id, state: contributions.state, synthetic: contributions.synthetic, createdAt: contributions.createdAt, errorCode: contributions.errorCode })
      .from(contributions).where(state && isState(state) ? eq(contributions.state, state) : undefined).orderBy(desc(contributions.createdAt), desc(contributions.id));
    return c.json({ records });
  });
  app.get("/v1/contributions/:id", async c => {
    const record = await detail(c.req.param("id"));
    return record ? c.json(record) : c.json({ code: "not_found" }, 404);
  });
  app.get("/v1/contributions/:id/image", async c => {
    const id = c.req.param("id");
    if (!validId(id)) return c.json({ code: "not_found" }, 404);
    const [media] = await db.select().from(mediaRefs).where(eq(mediaRefs.contributionId, id));
    if (!media) return c.json({ code: "not_found" }, 404);
    try { return c.body(new Uint8Array(await storage.read(media.key)), 200, { "Content-Type": "image/png" }); }
    catch { return c.json({ code: "image_unavailable" }, 404); }
  });
  app.put("/v1/contributions/:id/review", async c => {
    const id = c.req.param("id");
    if (!validId(id)) return c.json({ code: "not_found" }, 404);
    let input: unknown;
    try { input = await c.req.json(); } catch { return c.json({ code: "invalid_review" }, 422); }
    const code = await db.transaction(async tx => {
      const [record] = await tx.select().from(contributions).where(eq(contributions.id, id)).for("update");
      if (!record) return "not_found";
      if (!["needs_review", "reviewed", "fiscal_pending"].includes(record.state)) return "invalid_transition";
      const [observation] = await tx.select().from(observations).where(eq(observations.contributionId, id));
      if (!observation) return "invalid_transition";
      const review = validateReview(input, observation.draft);
      if (!review) return "invalid_review";
      const provenance = reviewProvenance(createReview(observation.draft), review);
      await tx.insert(reviews).values({ contributionId: id, data: review, provenance }).onConflictDoUpdate({ target: reviews.contributionId, set: { data: review, provenance, updatedAt: new Date() } });
      await tx.update(contributions).set({ state: "reviewed", steps: sql`${contributions.steps} || ${JSON.stringify([step("reviewed")])}::jsonb` }).where(eq(contributions.id, id));
      return null;
    });
    if (code) return c.json({ code }, code === "not_found" ? 404 : code === "invalid_review" ? 422 : 409);
    return c.json(await detail(id));
  });
  app.post("/v1/contributions/:id/complete-review", async c => {
    const id = c.req.param("id");
    if (!validId(id)) return c.json({ code: "not_found" }, 404);
    const rows = await db.update(contributions).set({ state: "fiscal_pending", steps: sql`${contributions.steps} || ${JSON.stringify([step("fiscal_pending")])}::jsonb` })
      .where(and(eq(contributions.id, id), eq(contributions.state, "reviewed"))).returning();
    return rows.length ? c.json(await detail(id)) : c.json({ code: "invalid_transition" }, 409);
  });
  app.post("/v1/contributions/:id/retry", async c => {
    const id = c.req.param("id");
    if (!validId(id)) return c.json({ code: "not_found" }, 404);
    const claimed = await db.update(contributions).set({ state: "processing", errorCode: null }).where(and(eq(contributions.id, id), eq(contributions.state, "processing_error"))).returning();
    if (!claimed.length) return c.json({ code: "invalid_transition" }, 409);
    const [media] = await db.select().from(mediaRefs).where(eq(mediaRefs.contributionId, id));
    try {
      if (!media) throw new Error();
      await processOcr(id, await storage.read(media.key));
    } catch { await transition(id, "processing_error", "image_unavailable"); }
    return c.json(await detail(id));
  });
  app.get("/v1/dashboard", async c => {
    const rows = await db.select({ state: contributions.state, count: count() }).from(contributions).groupBy(contributions.state);
    const counts = Object.fromEntries(Object.keys(stateLabels).map(state => [state, 0]));
    for (const row of rows) counts[row.state] = row.count;
    return c.json({ total: rows.reduce((sum, row) => sum + row.count, 0), counts });
  });
  return app;
}
