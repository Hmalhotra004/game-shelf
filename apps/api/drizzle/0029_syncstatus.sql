CREATE TYPE "public"."sync_type" AS ENUM('MASTERED_GAMES', 'PLATINUMED_GAMES');--> statement-breakpoint
CREATE TYPE "public"."sync_type_status" AS ENUM('Failed', 'Running', 'Completed');--> statement-breakpoint
CREATE TABLE "sync_status" (
	"id" text PRIMARY KEY NOT NULL,
	"sync_type" "sync_type" NOT NULL,
	"sync_type_status" "sync_type_status" NOT NULL,
	"started_at" timestamp NOT NULL,
	"finished_at" timestamp,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sync_user_type_unique" UNIQUE("user_id","sync_type")
);
--> statement-breakpoint
ALTER TABLE "sync_status" ADD CONSTRAINT "sync_status_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sync_user_type_idx" ON "sync_status" USING btree ("user_id","sync_type");--> statement-breakpoint
CREATE INDEX "sync_user_idx" ON "sync_status" USING btree ("user_id");