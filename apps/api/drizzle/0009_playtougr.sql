CREATE TYPE "public"."playthrough_status" AS ENUM('Active', 'On Hold', 'Archived');--> statement-breakpoint
CREATE TABLE "playthrough" (
	"id" text PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	"status" "playthrough_status" DEFAULT 'Active' NOT NULL,
	"total_seconds" integer DEFAULT 0 NOT NULL,
	"collection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playthrough_session" (
	"id" text PRIMARY KEY NOT NULL,
	"play_date" timestamp NOT NULL,
	"seconds_played" integer NOT NULL,
	"playthrough_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough_session" ADD CONSTRAINT "playthrough_session_playthrough_id_playthrough_id_fk" FOREIGN KEY ("playthrough_id") REFERENCES "public"."playthrough"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough_session" ADD CONSTRAINT "playthrough_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "playthrough_user_idx" ON "playthrough" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "playthrough_collection_idx" ON "playthrough" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "playthrough_status_idx" ON "playthrough" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_playthrough_idx" ON "playthrough_session" USING btree ("playthrough_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "playthrough_session" USING btree ("user_id");