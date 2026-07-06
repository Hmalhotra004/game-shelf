ALTER TABLE "collection" ALTER COLUMN "ownership_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "ownership_type" SET DEFAULT 'Bought'::text;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "ownership_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "ownership_type" SET DEFAULT 'Bought'::text;--> statement-breakpoint
DROP TYPE "public"."ownership_type";--> statement-breakpoint
CREATE TYPE "public"."ownership_type" AS ENUM('Bought', 'Gift', 'Free', 'Included', 'Rented', 'PS+', 'Steam Family', 'Game Pass');--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "ownership_type" SET DEFAULT 'Bought'::"public"."ownership_type";--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "ownership_type" SET DATA TYPE "public"."ownership_type" USING "ownership_type"::"public"."ownership_type";--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "ownership_type" SET DEFAULT 'Bought'::"public"."ownership_type";--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "ownership_type" SET DATA TYPE "public"."ownership_type" USING "ownership_type"::"public"."ownership_type";