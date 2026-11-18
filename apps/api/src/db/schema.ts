import { sql } from "drizzle-orm";
import { boolean, check, integer, jsonb, pgEnum, pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import type { DatasetRecord, ImageGeometry, LogicalTicket, OcrLine, PipelineResult, ProcessingError } from "@tuki/domain";

export type InternalResult = Omit<PipelineResult, "dataset"> | Omit<ProcessingError, "dataset">;
export type Metrics = { stages: Record<string, number>; peakRamBytes: number | null;
  memory: { node: number; ocr: number | null; ollama: number | null; complete: boolean } };
export const ticketState = pgEnum("ticket_state", ["accepted", "rejected", "processing_error"]);
export const jobStatus = pgEnum("job_status", ["pending", "running", "succeeded", "failed"]);
export const tickets = pgTable("tickets", {
  id: text().primaryKey(), sha256: text().notNull().unique(), country: text().notNull(),
  state: ticketState(), synthetic: boolean().notNull().default(false), errorCode: text("error_code"),
  result: jsonb().$type<InternalResult>(), versions: jsonb().$type<Record<string, unknown>>().notNull(),
  logical: jsonb().$type<LogicalTicket>(),
  metrics: jsonb().$type<Metrics>().notNull(), perceptualHash: text("perceptual_hash"),
  consentVersion: text("consent_version").notNull(), consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }), purgedAt: timestamp("purged_at", { withTimezone: true }),
}, table => [index("tickets_retention_idx").on(table.processedAt)]);
export const jobs = pgTable("jobs", {
  id: text().primaryKey(), ticketId: text("ticket_id").notNull().unique().references(() => tickets.id),
  status: jobStatus().notNull().default("pending"), attempts: integer().notNull().default(0), token: text(),
  deadline: timestamp({ withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("jobs_pending_idx").on(table.status, table.createdAt),
  uniqueIndex("jobs_one_running").on(sql`(1)`).where(sql`${table.status} = 'running'`),
  check("jobs_attempts_check", sql`${table.attempts} BETWEEN 0 AND 3`)]);
export const ticketArtifacts = pgTable("ticket_artifacts", {
  ticketId: text("ticket_id").primaryKey().references(() => tickets.id),
  originalKey: text("original_key"), preprocessedKey: text("preprocessed_key"),
  geometry: jsonb().$type<ImageGeometry>(), lines: jsonb().$type<OcrLine[]>(),
});
export const modelAttempts = pgTable("model_attempts", {
  id: text().primaryKey(), ticketId: text("ticket_id").notNull().references(() => tickets.id),
  jobAttempt: integer("job_attempt").notNull(), modelAttempt: integer("model_attempt").notNull(),
  raw: text().notNull(), complete: boolean().notNull(), reason: text(), model: text().notNull(), durationMs: integer("duration_ms").notNull(),
  versions: jsonb().$type<Record<string, unknown>>().notNull(),
});
export const jobRuns = pgTable("job_runs", {
  id: text().primaryKey(), ticketId: text("ticket_id").notNull().references(() => tickets.id),
  attempt: integer().notNull(), metrics: jsonb().$type<Metrics>().notNull(),
  outcome: text().notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
/** Buyer-facing consumers must use a separate, SELECT-only database role. */
export const datasetRecords = pgTable("dataset_records", {
  ticketId: text("ticket_id").primaryKey().references(() => tickets.id), record: jsonb().$type<DatasetRecord>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export * from "./legacy.js";
