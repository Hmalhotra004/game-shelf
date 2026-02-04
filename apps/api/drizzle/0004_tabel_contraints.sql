CREATE INDEX "collection_user_idx" ON "collection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collection_platform_idx" ON "collection" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "collection_provider_idx" ON "collection" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "list_user_idx" ON "list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "list_item_list_idx" ON "list_item" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "list_item_collection_idx" ON "list_item" USING btree ("collection_id");--> statement-breakpoint
ALTER TABLE "list_item" ADD CONSTRAINT "list_collection_unique" UNIQUE("list_id","collection_id");--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "provider_platform_check" CHECK (
      ("collection"."platform" = 'PS' AND "collection"."provider" IN ('PSN', 'Physical'))
      OR
      ("collection"."platform" = 'PC' AND "collection"."provider" IN ('Steam', 'Epic'))
      );