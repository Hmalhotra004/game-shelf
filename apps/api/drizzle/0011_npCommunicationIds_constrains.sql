ALTER TABLE "collection" ADD CONSTRAINT "np_ids_is_object" CHECK (jsonb_typeof("collection"."np_communication_ids") = 'object');--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "np_ids_allowed_keys" CHECK (("collection"."np_communication_ids" - ARRAY['PS3','PS4','PS5']) = '{}'::jsonb);--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "np_ids_keys_in_ps_version" CHECK (("collection"."np_communication_ids" - "collection"."ps_version"::text[]) = '{}'::jsonb);--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "np_ids_only_for_ps" CHECK ("collection"."platform" = 'PS' OR "collection"."np_communication_ids" = '{}'::jsonb);--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "np_ids_value_format" CHECK (NOT jsonb_path_exists(
    "collection"."np_communication_ids",
    '$.* ? (@.type() != "string" || !(@ like_regex "^NPWR[0-9]{5}_[0-9]{2}$"))'
  ));