ALTER TABLE "collection" ALTER COLUMN "ps_version" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "ps_version" SET DATA TYPE "public"."ps_version"[] USING "ps_version"::text::"public"."ps_version"[];--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "ps_version" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "ps_version" SET NOT NULL;