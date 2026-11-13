import { db } from "@/db";
import { and, eq, notExists, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  casualSession,
  collection,
  dlc,
  playthrough,
  playthroughSession,
} from "@/db/schema";

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

export const casualNotInArchivedCollection = () => {
  const parent = alias(collection, "casual_parent_collection");

  return and(
    notExists(
      db
        .select({ one: sql`1` })
        .from(collection)
        .where(
          and(
            eq(collection.id, casualSession.collectionId),
            eq(collection.archived, true),
          ),
        ),
    ),
    notExists(
      db
        .select({ one: sql`1` })
        .from(dlc)
        .leftJoin(parent, eq(parent.id, dlc.collectionId))
        .where(
          and(
            eq(dlc.id, casualSession.dlcId),
            or(eq(dlc.archived, true), eq(parent.archived, true)),
          ),
        ),
    ),
  );
};
