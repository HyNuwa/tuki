CREATE TYPE "public"."contribution_state" AS ENUM('uploaded', 'processing', 'extraction_ready', 'needs_review', 'reviewed', 'fiscal_pending', 'processing_error');--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"sha256" text NOT NULL,
	"state" "contribution_state" DEFAULT 'uploaded' NOT NULL,
	"synthetic" boolean DEFAULT false NOT NULL,
	"error_code" text,
	"steps" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contributions_sha256_unique" UNIQUE("sha256")
);
--> statement-breakpoint
CREATE TABLE "media_refs" (
	"contribution_id" text PRIMARY KEY NOT NULL,
	"digest" text NOT NULL,
	"key" text NOT NULL,
	"has_camera_exif" boolean NOT NULL,
	"software_tag_present" boolean NOT NULL,
	"capture_time_consistent" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"contribution_id" text PRIMARY KEY NOT NULL,
	"draft" jsonb NOT NULL,
	"ocr" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"contribution_id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"provenance" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_refs" ADD CONSTRAINT "media_refs_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;