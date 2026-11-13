CREATE TABLE "casual_session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_type" "game_type" NOT NULL,
	"play_date" timestamp with time zone NOT NULL,
	"seconds_played" integer NOT NULL,
	"notes" text,
	"collection_id" uuid,
	"dlc_id" uuid,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "casual_session_target_check" CHECK ((
        ("casual_session"."game_type" = 'Game' AND "casual_session"."collection_id" IS NOT NULL AND "casual_session"."dlc_id" IS NULL)
        OR
        ("casual_session"."game_type" = 'DLC' AND "casual_session"."dlc_id" IS NOT NULL AND "casual_session"."collection_id" IS NULL)
      )),
	CONSTRAINT "casual_session_seconds_check" CHECK ("casual_session"."seconds_played" > 0)
);
--> statement-breakpoint
ALTER TABLE "casual_session" ADD CONSTRAINT "casual_session_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casual_session" ADD CONSTRAINT "casual_session_dlc_id_dlc_id_fk" FOREIGN KEY ("dlc_id") REFERENCES "public"."dlc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casual_session" ADD CONSTRAINT "casual_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "casual_session_collection_idx" ON "casual_session" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "casual_session_dlc_idx" ON "casual_session" USING btree ("dlc_id");--> statement-breakpoint
CREATE INDEX "casual_session_user_idx" ON "casual_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "casual_session_play_date_idx" ON "casual_session" USING btree ("play_date");