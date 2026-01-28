ALTER TABLE "completion" ALTER COLUMN "completion_style" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "completion" ALTER COLUMN "completion_style" SET DEFAULT 'Story'::text;--> statement-breakpoint
DROP TYPE "public"."completion_style";--> statement-breakpoint
CREATE TYPE "public"."completion_style" AS ENUM('Speed Run', 'Story', 'Story + Some Extras', 'Story + Lots of Extras', 'Completionated', 'NG+ Run', 'Challenge Run', 'Achievement Run');--> statement-breakpoint
ALTER TABLE "completion" ALTER COLUMN "completion_style" SET DEFAULT 'Story'::"public"."completion_style";--> statement-breakpoint
ALTER TABLE "completion" ALTER COLUMN "completion_style" SET DATA TYPE "public"."completion_style" USING "completion_style"::"public"."completion_style";