CREATE TYPE "public"."playthrough_game_type" AS ENUM('Game', 'DLC');--> statement-breakpoint
ALTER TABLE "playthrough" ALTER COLUMN "collection_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "playthrough" ADD COLUMN "game_type" "playthrough_game_type" DEFAULT 'Game' NOT NULL;--> statement-breakpoint
ALTER TABLE "playthrough" ADD COLUMN "dlc_id" text;--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_dlc_id_dlc_id_fk" FOREIGN KEY ("dlc_id") REFERENCES "public"."dlc"("id") ON DELETE cascade ON UPDATE no action;