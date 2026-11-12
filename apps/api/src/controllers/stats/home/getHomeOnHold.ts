import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc, playthrough, playthroughSession } from "@/db/schema";
import { toISO } from "@/lib/utils";
import { and, eq, notExists, sql } from "drizzle-orm";
import type { Request, Response } from "express";

import {
  parentCollection,
  resolveTarget,
  targetSelect,
} from "@/lib/statsHelpers";

const LIMIT = 5;

// On Hold = playthroughs with status On Hold, plus games/DLC whose own status
// is On Hold and that have no On Hold playthrough (so nothing shows twice).
// Sorted by longest untouched first.
export const getHomeOnHold = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const lastSessionAt = sql<Date | null>`(
      select max(${playthroughSession.playDate})
      from ${playthroughSession}
      where ${playthroughSession.playthroughId} = ${playthrough.id}
    )`;

    const [playthroughs, games, dlcs] = await Promise.all([
      db
        .select({
          id: playthrough.id,
          gameType: playthrough.gameType,
          notes: playthrough.notes,
          totalSeconds: playthrough.totalSeconds,
          startedAt: playthrough.startedAt,
          createdAt: playthrough.createdAt,
          lastSessionAt,
          ...targetSelect,
        })
        .from(playthrough)
        .leftJoin(collection, eq(playthrough.collectionId, collection.id))
        .leftJoin(dlc, eq(playthrough.dlcId, dlc.id))
        .leftJoin(parentCollection, eq(dlc.collectionId, parentCollection.id))
        .where(
          and(
            eq(playthrough.userId, userId),
            eq(playthrough.status, "On Hold"),
          ),
        ),

      db
        .select({
          id: collection.id,
          name: collection.name,
          image: collection.image,
          customImage: collection.customImage,
          updatedAt: collection.updatedAt,
        })
        .from(collection)
        .where(
          and(
            eq(collection.userId, userId),
            eq(collection.status, "On Hold"),
            eq(collection.archived, false),
            notExists(
              db
                .select({ one: sql`1` })
                .from(playthrough)
                .where(
                  and(
                    eq(playthrough.collectionId, collection.id),
                    eq(playthrough.status, "On Hold"),
                  ),
                ),
            ),
          ),
        ),

      db
        .select({
          id: dlc.id,
          name: dlc.name,
          image: dlc.image,
          customImage: dlc.customImage,
          collectionId: dlc.collectionId,
          parentName: collection.name,
          updatedAt: dlc.updatedAt,
        })
        .from(dlc)
        .innerJoin(collection, eq(dlc.collectionId, collection.id))
        .where(
          and(
            eq(dlc.userId, userId),
            eq(dlc.status, "On Hold"),
            eq(dlc.archived, false),
            eq(collection.archived, false),
            notExists(
              db
                .select({ one: sql`1` })
                .from(playthrough)
                .where(
                  and(
                    eq(playthrough.dlcId, dlc.id),
                    eq(playthrough.status, "On Hold"),
                  ),
                ),
            ),
          ),
        ),
    ]);

    const items = [];

    for (const row of playthroughs) {
      const target = resolveTarget(row);
      if (!target) continue;

      items.push({
        source: "Playthrough",
        id: row.id,
        ...target,
        notes: row.notes,
        totalSeconds: row.totalSeconds,
        lastPlayedAt: toISO(
          row.lastSessionAt ?? row.startedAt ?? row.createdAt,
        ),
      });
    }

    // No session history exists for these, so updatedAt (last change to the
    // game/DLC, e.g. when it was put on hold) is the closest signal.
    for (const row of games) {
      items.push({
        source: "Collection",
        id: row.id,
        gameType: "Game",
        name: row.name,
        parentName: null,
        image: row.customImage ?? row.image,
        collectionId: row.id,
        targetId: row.id,
        notes: null,
        totalSeconds: 0,
        lastPlayedAt: toISO(row.updatedAt),
      });
    }

    for (const row of dlcs) {
      items.push({
        source: "Collection",
        id: row.id,
        gameType: "DLC",
        name: row.name,
        parentName: row.parentName,
        image: row.customImage ?? row.image,
        collectionId: row.collectionId,
        targetId: row.id,
        notes: null,
        totalSeconds: 0,
        lastPlayedAt: toISO(row.updatedAt),
      });
    }

    items.sort(
      (a, b) =>
        new Date(a.lastPlayedAt).getTime() - new Date(b.lastPlayedAt).getTime(),
    );

    return res
      .status(200)
      .json({ items: items.slice(0, LIMIT), total: items.length });
  } catch (err) {
    req.log.error({ err }, "GET_HOME_ON_HOLD_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
