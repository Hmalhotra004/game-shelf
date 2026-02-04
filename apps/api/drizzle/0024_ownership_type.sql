CREATE TYPE "public"."ownership_type" AS ENUM('Free', 'Gift', 'Bought', 'Rented', 'PS+', 'Steam Family', 'Game Pass');--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "ownership_type" "ownership_type" DEFAULT 'Bought' NOT NULL;--> statement-breakpoint
ALTER TABLE "dlc" ADD COLUMN "ownership_type" "ownership_type" DEFAULT 'Bought' NOT NULL;