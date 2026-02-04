CREATE TYPE "public"."ps_version" AS ENUM('PS4', 'PS5');--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "ps_version" "ps_version";--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "ps_version_only_for_ps" CHECK (
      ("collection"."platform" = 'PS' AND "collection"."ps_version" IS NOT NULL)
      OR
      ("collection"."platform" != 'PS' AND "collection"."ps_version" IS NULL)
      );