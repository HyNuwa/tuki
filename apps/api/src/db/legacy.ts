import { boolean, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Historical M3 storage only. Never served or used by the automatic pipeline.
// Keep the migration model until all legacy buyer-bearing data is purged.
export const legacyState = pgEnum("contribution_state", ["uploaded", "processing", "extraction_ready", "needs_review", "reviewed", "fiscal_pending", "processing_error"]);
export const legacyContributions = pgTable("contributions", {
  id: text().primaryKey(), sha256: text().notNull().unique(), state: legacyState().notNull().default("uploaded"),
  synthetic: boolean().notNull().default(false), errorCode: text("error_code"), steps: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const legacyObservations = pgTable("observations", { contributionId: text("contribution_id").primaryKey().references(() => legacyContributions.id), draft: jsonb().notNull(), ocr: jsonb().notNull() });
export const legacyReviews = pgTable("reviews", { contributionId: text("contribution_id").primaryKey().references(() => legacyContributions.id), data: jsonb().notNull(), provenance: jsonb().notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow() });
export const legacyMedia = pgTable("media_refs", { contributionId: text("contribution_id").primaryKey().references(() => legacyContributions.id), digest: text().notNull(), key: text().notNull(), hasCameraExif: boolean("has_camera_exif").notNull(), softwareTagPresent: boolean("software_tag_present").notNull(), captureTimeConsistent: boolean("capture_time_consistent").notNull() });
