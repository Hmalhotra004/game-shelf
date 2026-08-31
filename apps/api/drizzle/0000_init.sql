CREATE TYPE "public"."game_type" AS ENUM('Game', 'DLC');--> statement-breakpoint
CREATE TYPE "public"."ps_version" AS ENUM('PS5', 'PS4', 'PS3', 'PS2', 'PS1');--> statement-breakpoint
CREATE TYPE "public"."completion_style" AS ENUM('Speed Run', 'Story', 'Story + Some Extras', 'Story + Lots of Extras', 'Completionated', 'NG+ Run', 'Challenge Run', 'Achievement Run');--> statement-breakpoint
CREATE TYPE "public"."ownership_type" AS ENUM('Bought', 'Gift', 'Free', 'Included', 'Rented', 'PS+', 'Steam Family', 'Game Pass');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('PS', 'XBOX', 'PC');--> statement-breakpoint
CREATE TYPE "public"."playthrough_status" AS ENUM('Active', 'On Hold', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('PSN', 'XBOX', 'Physical', 'Steam', 'Epic');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Online', 'Backlog', 'Playing', 'On Hold', 'Dropped', 'Story Completed', 'Platinum', 'Platinum+', '100% Completed');--> statement-breakpoint
CREATE TYPE "public"."UserAccount" AS ENUM('User', 'Admin');--> statement-breakpoint
CREATE TABLE "collection" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"edition" text,
	"date_of_purchase" timestamp,
	"amount" numeric(10, 2),
	"image" text,
	"custom_image" text,
	"cover_image" text,
	"custom_cover_image" text,
	"ownership_type" "ownership_type" DEFAULT 'Bought' NOT NULL,
	"status" "status" DEFAULT 'Backlog' NOT NULL,
	"platform" "platform" DEFAULT 'PC' NOT NULL,
	"provider" "provider" DEFAULT 'Steam' NOT NULL,
	"ps_version" "ps_version",
	"completions" integer DEFAULT 0 NOT NULL,
	"dlc_count" integer DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"igdbId" text NOT NULL,
	"np_communication_id" text,
	"steam_app_id" text,
	"steam_grid_db_id" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_steam_game_unique" UNIQUE("user_id","steam_app_id","provider"),
	CONSTRAINT "provider_platform_check" CHECK (
      ("collection"."platform" = 'PS' AND "collection"."provider" IN ('PSN', 'Physical'))
      OR
      ("collection"."platform" = 'PC' AND "collection"."provider" IN ('Steam', 'Epic'))
      OR
      ("collection"."platform" = 'XBOX' AND "collection"."provider" IN ('XBOX', 'Physical'))
      ),
	CONSTRAINT "ps_version_only_for_ps" CHECK (
      ("collection"."platform" = 'PS' AND "collection"."ps_version" IS NOT NULL)
      OR
      ("collection"."platform" != 'PS' AND "collection"."ps_version" IS NULL)
      )
);
--> statement-breakpoint
CREATE TABLE "dlc" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date_of_purchase" timestamp,
	"amount" numeric(10, 2),
	"image" text,
	"custom_image" text,
	"cover_image" text,
	"custom_cover_image" text,
	"ownership_type" "ownership_type" DEFAULT 'Bought' NOT NULL,
	"status" "status" DEFAULT 'Backlog' NOT NULL,
	"completions" integer DEFAULT 0 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"igdbId" text NOT NULL,
	"np_communication_id" text,
	"steam_app_id" text,
	"steam_grid_db_id" text,
	"collection_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completion" (
	"id" text PRIMARY KEY NOT NULL,
	"game_type" "game_type" DEFAULT 'Game' NOT NULL,
	"total_playtime" integer,
	"completed_at" timestamp,
	"notes" text,
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
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"steam_id" text,
	"psn_account_id" text,
	"user_account_type" "UserAccount" DEFAULT 'User' NOT NULL,
	"is_adult" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playthrough" (
	"id" text PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	"status" "playthrough_status" DEFAULT 'Active' NOT NULL,
	"total_seconds" integer DEFAULT 0 NOT NULL,
	"game_type" "game_type" DEFAULT 'Game' NOT NULL,
	"notes" text,
	"collection_id" text,
	"dlc_id" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "playthrough_game_or_dlc_check" CHECK (
    ("playthrough"."game_type" = 'Game' AND "playthrough"."collection_id" IS NOT NULL AND "playthrough"."dlc_id" IS NULL)
    OR
    ("playthrough"."game_type" = 'DLC' AND "playthrough"."dlc_id" IS NOT NULL AND "playthrough"."collection_id" IS NULL)
  )
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
CREATE TABLE "list" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_item" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"collection_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "list_collection_unique" UNIQUE("list_id","collection_id")
);
--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dlc" ADD CONSTRAINT "dlc_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dlc" ADD CONSTRAINT "dlc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_dlc_id_dlc_id_fk" FOREIGN KEY ("dlc_id") REFERENCES "public"."dlc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion" ADD CONSTRAINT "completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_dlc_id_dlc_id_fk" FOREIGN KEY ("dlc_id") REFERENCES "public"."dlc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough" ADD CONSTRAINT "playthrough_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough_session" ADD CONSTRAINT "playthrough_session_playthrough_id_playthrough_id_fk" FOREIGN KEY ("playthrough_id") REFERENCES "public"."playthrough"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playthrough_session" ADD CONSTRAINT "playthrough_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list" ADD CONSTRAINT "list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_list_id_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_user_idx" ON "collection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collection_platform_idx" ON "collection" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "collection_provider_idx" ON "collection" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "dlc_collection_idx" ON "dlc" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "dlc_user_idx" ON "dlc" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "completion_user_idx" ON "completion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "completion_collection_idx" ON "completion" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "completion_dlc_idx" ON "completion" USING btree ("dlc_id");--> statement-breakpoint
CREATE INDEX "playthrough_user_idx" ON "playthrough" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "playthrough_collection_idx" ON "playthrough" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "playthrough_status_idx" ON "playthrough" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_playthrough_idx" ON "playthrough_session" USING btree ("playthrough_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "playthrough_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "list_user_idx" ON "list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "list_item_list_idx" ON "list_item" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "list_item_collection_idx" ON "list_item" USING btree ("collection_id");