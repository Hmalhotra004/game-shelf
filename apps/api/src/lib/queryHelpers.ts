import { db } from "@/db";
import { collection, dlc, playthrough, playthroughSession } from "@/db/schema";
import { and, eq, notExists, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

/**
 * Excludes sessions whose playthrough is hidden by an archived game,
 * an archived DLC, or the archived parent game of a DLC.
 */
export const notInArchivedCollection = () => {
  const parent = alias(collection, "parent_collection");

  return notExists(
    db
      .select({ one: sql`1` })
      .from(playthrough)
      .leftJoin(collection, eq(collection.id, playthrough.collectionId))
      .leftJoin(dlc, eq(dlc.id, playthrough.dlcId))
      .leftJoin(parent, eq(parent.id, dlc.collectionId))
      .where(
        and(
          eq(playthrough.id, playthroughSession.playthroughId),
          or(
            eq(collection.archived, true),
            eq(dlc.archived, true),
            eq(parent.archived, true),
          ),
        ),
      ),
  );
};
