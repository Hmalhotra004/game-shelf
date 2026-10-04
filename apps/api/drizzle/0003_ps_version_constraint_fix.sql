ALTER TABLE "collection" DROP CONSTRAINT "ps_version_only_for_ps";--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "ps_version_only_for_ps" CHECK (
      ("collection"."platform" = 'PS' AND cardinality("collection"."ps_version") >= 1)
      OR
      ("collection"."platform" != 'PS' AND cardinality("collection"."ps_version") = 0)
      );