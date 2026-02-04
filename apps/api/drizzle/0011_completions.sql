CREATE TYPE "public"."game_type" AS ENUM('Game', 'DLC');--> statement-breakpoint
CREATE TYPE "public"."completion_style" AS ENUM('Speed Run', 'Story', 'Story + Some Extras', 'Story + Lots of Extras', 'Completionated', 'NG+ Run', 'Challenge Run', 'Achievement Run', 'Mastered');--> statement-breakpoint
CREATE TABLE "completion" (
	"id" text PRIMARY KEY NOT NULL,
	"game_type" "game_type" DEFAULT 'Game' NOT NULL,
	"total_playtime" integer DEFAULT 0,
	"completed_at" timestamp,
	"completion_style" "completion_style" DEFAULT 'Story' NOT NULL,
	"collection_id" text,
	"dlc_id" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "completion_game_or_dlc_check" CHECK (
        ("completion"."game_type" = 'Game' AND "completion"."collection_id" IS NOT NULL AND "completion"."dlc_id" IS NULL)
        OR
        ("completion"."game_type" = 'DLC' AND "completion"."dlc_id" IS NOT NULL AND "completion"."collection_id" IS NULL)
      )
);
--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "status" SET DEFAULT 'Backlog'::text;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "status" SET DEFAULT 'Backlog'::text;--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Backlog', 'Playing', 'On Hold', 'Dropped', 'Story Completed', 'Platinum', 'Platinum+', '100% Completed');--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "status" SET DEFAULT 'Backlog'::"public"."status";--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "status" SET DEFAULT 'Backlog'::"public"."status";--> statement-breakpoint
ALTER TABLE "dlc" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "playthrough" ALTER COLUMN "game_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "playthrough" ALTER COLUMN "game_type" SET DATA TYPE "public"."game_type" USING "game_type"::text::"public"."game_type";--> statement-breakpoint
ALTER TABLE "playthrough" ALTER COLUMN "game_type" SET DEFAULT 'Game';--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_dlc_id_dlc_id_fk" FOREIGN KEY ("dlc_id") REFERENCES "public"."dlc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "completion_user_idx" ON "completion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "completion_collection_idx" ON "completion" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "completion_dlc_idx" ON "completion" USING btree ("dlc_id");--> statement-breakpoint