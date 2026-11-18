import { and, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { countryModules } from "@tuki/domain";
import type { Database } from "../db/database.js";
import { datasetRecords, jobs, modelAttempts, ticketArtifacts, tickets, type InternalResult } from "../db/schema.js";
import type { MediaStorage } from "../storage/media.js";
import { QUEUE_LOCK } from "./queue.js";

/** Retain quality statistics, never free text or indirect copies of fiscal/buyer data. */
export function retainedResult(result: InternalResult | null): InternalResult | null {
  if (!result || !("campos" in result)) return result;
  return { ...result, campos: {}, items: [], texto_no_interpretado: [],
    metadatos: { ...result.metadatos, id_fiscal: null, qr: null } };
}

/** Retry-safe purge: remove objects first, mark purged only after all artifacts are cleared. */
export async function purgeExpired(db: Database, storage: MediaStorage, now = new Date()): Promise<number> {
  const session = await db.$client.reserve(); let locked = false;
  try {
    locked = !!(await session`SELECT pg_try_advisory_lock(${QUEUE_LOCK}) AS acquired`)[0]?.acquired;
    if (!locked) return 0;
    const candidates = await db.select().from(tickets).where(and(isNotNull(tickets.processedAt), isNull(tickets.purgedAt)));
    let count = 0;
    for (const ticket of candidates) {
      const days = Object.hasOwn(countryModules, ticket.country) ? countryModules[ticket.country]!.retencion_dias : 30;
      if (ticket.processedAt!.getTime() + days * 86_400_000 > now.getTime()) continue;
      const [artifact] = await db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, ticket.id));
      for (const key of new Set([artifact?.originalKey, artifact?.preprocessedKey].filter((key): key is string => !!key))) {
        const references = await db.select({ id: ticketArtifacts.ticketId }).from(ticketArtifacts).where(and(sql`${ticketArtifacts.ticketId} <> ${ticket.id}`,
          or(eq(ticketArtifacts.originalKey, key), eq(ticketArtifacts.preprocessedKey, key))));
        const legacyRefs = await db.execute(sql`SELECT 1 FROM media_refs WHERE key = ${key} LIMIT 1`);
        if (!references.length && !legacyRefs.length) await storage.remove(key);
      }
      await db.transaction(async tx => {
        await tx.delete(modelAttempts).where(eq(modelAttempts.ticketId, ticket.id));
        await tx.update(ticketArtifacts).set({ originalKey: null, preprocessedKey: null, geometry: null, lines: null }).where(eq(ticketArtifacts.ticketId, ticket.id));
        await tx.update(tickets).set({ result: retainedResult(ticket.result), logical: null, purgedAt: now }).where(eq(tickets.id, ticket.id));
      });
      count++;
    }
    // Old M3 rows are historical, not automatically reinterpreted as accepted tickets.
    // Their buyer-bearing drafts/reviews/normalized images follow the same retention.
    // Raw SQL has no column encoder: pass ISO text, not a JavaScript Date.
    const legacyCutoff = new Date(now.getTime() - 30 * 86_400_000).toISOString();
    const legacy = await db.execute(sql`SELECT c.id, m.key FROM contributions c LEFT JOIN media_refs m ON m.contribution_id = c.id WHERE c.created_at < ${legacyCutoff}::timestamptz AND (EXISTS (SELECT 1 FROM media_refs x WHERE x.contribution_id = c.id) OR EXISTS (SELECT 1 FROM observations x WHERE x.contribution_id = c.id) OR EXISTS (SELECT 1 FROM reviews x WHERE x.contribution_id = c.id))`);
    for (const row of legacy) {
      if (typeof row.key === "string") {
        const refs = await db.select({ id: ticketArtifacts.ticketId }).from(ticketArtifacts).where(or(eq(ticketArtifacts.originalKey, row.key), eq(ticketArtifacts.preprocessedKey, row.key)));
        const others = await db.execute(sql`SELECT 1 FROM media_refs WHERE key = ${row.key} AND contribution_id <> ${String(row.id)} LIMIT 1`);
        if (!refs.length && !others.length) await storage.remove(row.key);
      }
      await db.transaction(async tx => {
        await tx.execute(sql`DELETE FROM observations WHERE contribution_id = ${String(row.id)}`);
        await tx.execute(sql`DELETE FROM reviews WHERE contribution_id = ${String(row.id)}`);
        await tx.execute(sql`DELETE FROM media_refs WHERE contribution_id = ${String(row.id)}`);
      });
    }
    // A filesystem write can survive a rolled-back transaction or API crash.
    // Sweep only old, content-addressed, entirely unreferenced objects.
    for (const key of await storage.expiredKeys(new Date(now.getTime() - 30 * 86_400_000))) {
      await db.transaction(async tx => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`);
        const refs = await tx.select({ id: ticketArtifacts.ticketId }).from(ticketArtifacts).where(or(eq(ticketArtifacts.originalKey, key), eq(ticketArtifacts.preprocessedKey, key)));
        const legacyRefs = await tx.execute(sql`SELECT 1 FROM media_refs WHERE key = ${key} LIMIT 1`);
        if (!refs.length && !legacyRefs.length) await storage.remove(key);
      });
    }
    return count;
  } finally {
    try { if (locked) await session`SELECT pg_advisory_unlock(${QUEUE_LOCK})`; } finally { session.release(); }
  }
}

/** Operator-only erasure seam; no editable/review API is reintroduced. */
export async function eraseTicket(db: Database, storage: MediaStorage, ticketId: string): Promise<boolean> {
  const session = await db.$client.reserve(); let locked = false;
  try {
    locked = !!(await session`SELECT pg_try_advisory_lock(${QUEUE_LOCK}) AS acquired`)[0]?.acquired;
    if (!locked) throw new Error("worker_busy");
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId)); if (!ticket) return false;
    const [artifact] = await db.select().from(ticketArtifacts).where(eq(ticketArtifacts.ticketId, ticketId));
    for (const key of new Set([artifact?.originalKey, artifact?.preprocessedKey].filter((key): key is string => !!key))) {
      const refs = await db.select({ id: ticketArtifacts.ticketId }).from(ticketArtifacts).where(and(sql`${ticketArtifacts.ticketId} <> ${ticketId}`, or(eq(ticketArtifacts.originalKey, key), eq(ticketArtifacts.preprocessedKey, key))));
      const legacyRefs = await db.execute(sql`SELECT 1 FROM media_refs WHERE key = ${key} LIMIT 1`);
      if (!refs.length && !legacyRefs.length) await storage.remove(key);
    }
    await db.transaction(async tx => {
      await tx.delete(datasetRecords).where(eq(datasetRecords.ticketId, ticketId));
      await tx.delete(modelAttempts).where(eq(modelAttempts.ticketId, ticketId));
      await tx.execute(sql`DELETE FROM job_runs WHERE ticket_id = ${ticketId}`);
      await tx.delete(ticketArtifacts).where(eq(ticketArtifacts.ticketId, ticketId));
      await tx.delete(jobs).where(eq(jobs.ticketId, ticketId));
      await tx.delete(tickets).where(eq(tickets.id, ticketId));
    });
    return true;
  } finally { try { if (locked) await session`SELECT pg_advisory_unlock(${QUEUE_LOCK})`; } finally { session.release(); } }
}

