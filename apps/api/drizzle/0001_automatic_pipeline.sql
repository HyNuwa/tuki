CREATE TYPE "ticket_state" AS ENUM ('accepted', 'rejected', 'processing_error');
--> statement-breakpoint
CREATE TYPE "job_status" AS ENUM ('pending', 'running', 'succeeded', 'failed');
--> statement-breakpoint
CREATE TABLE "tickets" (
  "id" text PRIMARY KEY, "sha256" text NOT NULL UNIQUE, "country" text NOT NULL,
  "state" ticket_state, "synthetic" boolean NOT NULL DEFAULT false, "error_code" text,
  "result" jsonb, "versions" jsonb NOT NULL, "logical" jsonb, "metrics" jsonb NOT NULL, "perceptual_hash" text,
  "consent_version" text NOT NULL, "consent_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(), "processed_at" timestamptz, "purged_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "tickets_retention_idx" ON "tickets" ("processed_at");
--> statement-breakpoint
CREATE TABLE "jobs" (
  "id" text PRIMARY KEY, "ticket_id" text NOT NULL UNIQUE REFERENCES "tickets"("id"),
  "status" job_status NOT NULL DEFAULT 'pending', "attempts" integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3),
  "token" text, "deadline" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "jobs_pending_idx" ON "jobs" ("status", "created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_one_running" ON "jobs" ((1)) WHERE status = 'running';
--> statement-breakpoint
CREATE TABLE "ticket_artifacts" (
  "ticket_id" text PRIMARY KEY REFERENCES "tickets"("id"),
  "original_key" text, "preprocessed_key" text, "geometry" jsonb, "lines" jsonb
);
--> statement-breakpoint
CREATE TABLE "model_attempts" (
  "id" text PRIMARY KEY, "ticket_id" text NOT NULL REFERENCES "tickets"("id"),
  "job_attempt" integer NOT NULL, "model_attempt" integer NOT NULL,
  "raw" text NOT NULL, "complete" boolean NOT NULL, "model" text NOT NULL, "duration_ms" integer NOT NULL, "versions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
  "id" text PRIMARY KEY, "ticket_id" text NOT NULL REFERENCES "tickets"("id"),
  "attempt" integer NOT NULL, "metrics" jsonb NOT NULL, "outcome" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dataset_records" (
  "ticket_id" text PRIMARY KEY REFERENCES "tickets"("id"), "record" jsonb NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
-- No login or password is created here. Operators provision the buyer credential separately.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tuki_dataset_reader') THEN
    CREATE ROLE tuki_dataset_reader NOLOGIN;
  END IF;
END $$;
--> statement-breakpoint
REVOKE ALL ON TABLE tickets, jobs, ticket_artifacts, model_attempts, job_runs,
  contributions, observations, reviews, media_refs FROM PUBLIC, tuki_dataset_reader;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO tuki_dataset_reader;
--> statement-breakpoint
GRANT SELECT ON dataset_records TO tuki_dataset_reader;
