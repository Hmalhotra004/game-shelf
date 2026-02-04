CREATE TYPE "public"."game_record_type" AS ENUM('PLATINUM', 'MASTERED');--> statement-breakpoint
CREATE TABLE "game_record" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "game_record_type" NOT NULL,
	"date_unlocked" timestamp NOT NULL,
	"hours_spent" integer DEFAULT 0 NOT NULL,
	"collection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_record_unique" UNIQUE("user_id","collection_id","type"),
	CONSTRAINT "game_record_hours_non_negative" CHECK ("game_record"."hours_spent" >= 0)
);
--> statement-breakpoint
ALTER TABLE "mastered_games" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "platinum_list" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "mastered_games" CASCADE;--> statement-breakpoint
DROP TABLE "platinum_list" CASCADE;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game_record" ADD CONSTRAINT "game_record_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_record" ADD CONSTRAINT "game_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_record_user_idx" ON "game_record" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_record_collection_idx" ON "game_record" USING btree ("collection_id");--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_game_or_dlc_check" CHECK (
    ("playthrough"."game_type" = 'Game' AND "playthrough"."collection_id" IS NOT NULL AND "playthrough"."dlc_id" IS NULL)
    OR
    ("playthrough"."game_type" = 'DLC' AND "playthrough"."dlc_id" IS NOT NULL AND "playthrough"."collection_id" IS NULL)
  );