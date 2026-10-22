
ALTER TABLE "collection" ALTER COLUMN "np_communication_ids" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "np_communication_ids" SET DATA TYPE jsonb USING '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "np_communication_ids" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "np_communication_ids" SET NOT NULL;--> statement-breakpoint