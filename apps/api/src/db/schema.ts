import { boolean, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { Draft, Extraction, Provenance, Review } from "@tuki/domain";

export const contributionState = pgEnum("contribution_state", ["uploaded", "processing", "extraction_ready", "needs_review", "reviewed", "fiscal_pending", "processing_error"]);
export type Step = { step: string; at: string };
export const contributions = pgTable("contributions", {
  id: text().primaryKey(), sha256: text().notNull().unique(),
  state: contributionState().notNull().default("uploaded"),
  synthetic: boolean().notNull().default(false), errorCode: text("error_code"),
  steps: jsonb().$type<Step[]>().notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const observations = pgTable("observations", {
  contributionId: text("contribution_id").primaryKey().references(() => contributions.id),
  draft: jsonb().$type<Draft>().notNull(), ocr: jsonb().$type<Extraction["ocr"]>().notNull(),
});
export const mediaRefs = pgTable("media_refs", {
  contributionId: text("contribution_id").primaryKey().references(() => contributions.id),
  digest: text().notNull(), key: text().notNull(),
  hasCameraExif: boolean("has_camera_exif").notNull(), softwareTagPresent: boolean("software_tag_present").notNull(),
  captureTimeConsistent: boolean("capture_time_consistent").notNull(),
});
export const reviews = pgTable("reviews", {
  contributionId: text("contribution_id").primaryKey().references(() => contributions.id),
  data: jsonb().$type<Review>().notNull(), provenance: jsonb().$type<Record<string, Provenance>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
