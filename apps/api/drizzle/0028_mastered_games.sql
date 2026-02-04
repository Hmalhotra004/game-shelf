CREATE TABLE "mastered_games" (
	"id" text PRIMARY KEY NOT NULL,
	"date_unlocked" timestamp NOT NULL,
	"hours_spent" integer DEFAULT 0 NOT NULL,
	"collection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mastered_user_collection_unique" UNIQUE("user_id","collection_id"),
	CONSTRAINT "mastered_hours_non_negative" CHECK ("mastered_games"."hours_spent" >= 0)
);
--> statement-breakpoint
ALTER TABLE "mastered_games" ADD CONSTRAINT "mastered_games_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mastered_games" ADD CONSTRAINT "mastered_games_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mastered_user_idx" ON "mastered_games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mastered_collection_idx" ON "mastered_games" USING btree ("collection_id");