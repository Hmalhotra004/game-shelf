ALTER TABLE "collection"
  ALTER COLUMN "date_of_purchase" SET DATA TYPE timestamptz USING "date_of_purchase" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "dlc"
  ALTER COLUMN "date_of_purchase" SET DATA TYPE timestamptz USING "date_of_purchase" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "completion"
  ALTER COLUMN "completed_at" SET DATA TYPE timestamptz USING "completed_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "account"
  ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamptz USING "access_token_expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamptz USING "refresh_token_expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "session"
  ALTER COLUMN "expires_at" SET DATA TYPE timestamptz USING "expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user"
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "verification"
  ALTER COLUMN "expires_at" SET DATA TYPE timestamptz USING "expires_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "playthrough"
  ALTER COLUMN "started_at" SET DATA TYPE timestamptz USING "started_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "finished_at" SET DATA TYPE timestamptz USING "finished_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" SET DATA TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "playthrough_session"
  ALTER COLUMN "play_date" SET DATA TYPE timestamptz USING "play_date" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "list"
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "list_item"
  ALTER COLUMN "created_at" SET DATA TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';