CREATE TYPE "public"."UserAccount" AS ENUM('User', 'Admin');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steam_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "psn_npsso" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_account" "UserAccount" DEFAULT 'User' NOT NULL;