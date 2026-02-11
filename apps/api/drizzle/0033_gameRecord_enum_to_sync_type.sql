ALTER TABLE "game_record" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sync_status" ALTER COLUMN "sync_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."sync_type";--> statement-breakpoint
CREATE TYPE "public"."sync_type" AS ENUM('PLATINUM', 'MASTERED');--> statement-breakpoint
ALTER TABLE "game_record" ALTER COLUMN "type" SET DATA TYPE "public"."sync_type" USING "type"::"public"."sync_type";--> statement-breakpoint
ALTER TABLE "sync_status" ALTER COLUMN "sync_type" SET DATA TYPE "public"."sync_type" USING "sync_type"::"public"."sync_type";--> statement-breakpoint
ALTER TABLE "game_record" ALTER COLUMN "type" SET DATA TYPE "public"."sync_type" USING "type"::text::"public"."sync_type";--> statement-breakpoint
DROP TYPE "public"."game_record_type";