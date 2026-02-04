CREATE TABLE "dlc" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date_of_purchase" timestamp NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"cover_image" text NOT NULL,
	"completions" integer DEFAULT 0 NOT NULL,
	"np_communication_id" text,
	"steam_app_id" text,
	"collection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dlc" ADD CONSTRAINT "dlc_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dlc" ADD CONSTRAINT "dlc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dlc_collection_idx" ON "dlc" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "dlc_user_idx" ON "dlc" USING btree ("user_id");