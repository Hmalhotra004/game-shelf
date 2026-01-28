CREATE TABLE "platinum_list" (
	"id" text PRIMARY KEY NOT NULL,
	"date_unlocked" timestamp NOT NULL,
	"hours_spent" integer DEFAULT 0 NOT NULL,
	"collection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platinum_user_collection_unique" UNIQUE("user_id","collection_id"),
	CONSTRAINT "platinum_hours_non_negative" CHECK ("platinum_list"."hours_spent" >= 0)
);
--> statement-breakpoint
ALTER TABLE "platinum_list" ADD CONSTRAINT "platinum_list_collection_id_list_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platinum_list" ADD CONSTRAINT "platinum_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platinum_user_idx" ON "platinum_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "platinum_collection_idx" ON "platinum_list" USING btree ("collection_id");