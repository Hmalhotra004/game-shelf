CREATE TYPE "public"."status" AS ENUM('Backlog', 'Playing', 'Completed', 'Platinumed', 'Platinumed but not 100%');--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "cover_image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "cover_image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "status" "status" DEFAULT 'Backlog' NOT NULL;--> statement-breakpoint
ALTER TABLE "dlc" ADD COLUMN "status" "status" DEFAULT 'Backlog' NOT NULL;