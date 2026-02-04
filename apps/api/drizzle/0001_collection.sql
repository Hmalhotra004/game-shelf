CREATE TYPE "public"."platform" AS ENUM('PS', 'PC');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('PSN', 'Physical', 'Steam', 'Epic');--> statement-breakpoint
CREATE TABLE "collection" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date_of_purchase" timestamp NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"completions" integer DEFAULT 0 NOT NULL,
	"cover_image" text,
	"platform" "platform" DEFAULT 'PS' NOT NULL,
	"provider" "provider" DEFAULT 'PSN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
