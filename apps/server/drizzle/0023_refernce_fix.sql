ALTER TABLE "platinum_list" DROP CONSTRAINT "platinum_list_collection_id_list_id_fk";
--> statement-breakpoint
ALTER TABLE "platinum_list" ADD CONSTRAINT "platinum_list_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;