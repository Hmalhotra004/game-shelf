ALTER TABLE "user" RENAME COLUMN "psn_npsso" TO "psn_account_user_name";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "psn_account_id" text;