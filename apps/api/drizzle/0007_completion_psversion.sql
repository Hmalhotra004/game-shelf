ALTER TABLE "completion" ADD COLUMN "platform" "platform" NOT NULL;--> statement-breakpoint
ALTER TABLE "completion" ADD COLUMN "ps_version" "ps_version";--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "ps_version_only_for_ps" CHECK (
      ("completion"."platform" = 'PS' AND "completion"."ps_version" IS NOT NULL)
      OR
      ("completion"."platform" != 'PS' AND "completion"."ps_version" IS NULL)
      );