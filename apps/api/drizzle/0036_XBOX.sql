ALTER TYPE "public"."platform" ADD VALUE 'XBOX' BEFORE 'PC';--> statement-breakpoint
ALTER TYPE "public"."provider" ADD VALUE 'XBOX' BEFORE 'Physical';--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "platform" SET DEFAULT 'PC';--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "provider" SET DEFAULT 'Steam';