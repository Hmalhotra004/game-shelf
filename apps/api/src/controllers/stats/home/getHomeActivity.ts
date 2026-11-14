import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc, playthrough } from "@/db/schema";
import { toISO } from "@/lib/utils";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";

import {
  parentCollection,
  resolveTarget,
  targetSelect,
} from "@/lib/statsHelpers";

const LIMIT = 5;

export const getHomeActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const completedAt = sql<Date>`coalesce(${completion.completedAt}, ${completion.createdAt})`;
    const startedAt = sql<Date>`coalesce(${playthrough.startedAt}, ${playthrough.createdAt})`;
    const gameAddedAt = sql<Date>`coalesce(${collection.dateOfPurchase}, ${collection.createdAt})`;
    const dlcAddedAt = sql<Date>`coalesce(${dlc.dateOfPurchase}, ${dlc.createdAt})`;

    const [completions, started, games, dlcs] = await Promise.all([
      db
        .select({
          id: completion.id,
          gameType: completion.gameType,
          occurredAt: completedAt,
          ...targetSelect,
        })
        .from(completion)
        .leftJoin(collection, eq(completion.collectionId, collection.id))
        .leftJoin(dlc, eq(completion.dlcId, dlc.id))
        .leftJoin(parentCollection, eq(dlc.collectionId, parentCollection.id))
        .where(eq(completion.userId, userId))
        .orderBy(desc(completedAt))
        .limit(LIMIT),

      db
        .select({
          id: playthrough.id,
          gameType: playthrough.gameType,
          occurredAt: startedAt,
          ...targetSelect,
        })
        .from(playthrough)
        .leftJoin(collection, eq(playthrough.collectionId, collection.id))
        .leftJoin(dlc, eq(playthrough.dlcId, dlc.id))
        .leftJoin(parentCollection, eq(dlc.collectionId, parentCollection.id))
        .where(eq(playthrough.userId, userId))
        .orderBy(desc(startedAt))
        .limit(LIMIT),

      db
        .select({
          id: collection.id,
          name: collection.name,
          image: collection.image,
          customImage: collection.customImage,
          occurredAt: gameAddedAt,
        })
        .from(collection)
        .where(
          and(eq(collection.userId, userId), eq(collection.archived, false)),
        )
        .orderBy(desc(gameAddedAt))
        .limit(LIMIT),

      db
        .select({
          id: dlc.id,
          name: dlc.name,
          image: dlc.image,
          customImage: dlc.customImage,
          collectionId: dlc.collectionId,
          parentName: collection.name,
          occurredAt: dlcAddedAt,
        })
        .from(dlc)
        .innerJoin(collection, eq(dlc.collectionId, collection.id))
        .where(and(eq(dlc.userId, userId), eq(dlc.archived, false)))
        .orderBy(desc(dlcAddedAt))
        .limit(LIMIT),
    ]);

    const items = [];

    for (const row of completions) {
      const target = resolveTarget(row);
      if (!target) continue;

      const { targetId: _t, ...rest } = target;
      items.push({
        id: `Completed:${row.id}`,
        kind: "Completed",
        ...rest,
        occurredAt: toISO(row.occurredAt),
      });
    }

    for (const row of started) {
      const target = resolveTarget(row);
      if (!target) continue;

      const { targetId: _t, ...rest } = target;
      items.push({
        id: `PlaythroughStarted:${row.id}`,
        kind: "PlaythroughStarted",
        ...rest,
        occurredAt: toISO(row.occurredAt),
      });
    }

    for (const row of games) {
      items.push({
        id: `GameAdded:${row.id}`,
        kind: "GameAdded",
        gameType: "Game",
        name: row.name,
        parentName: null,
        image: row.customImage ?? row.image,
        collectionId: row.id,
        occurredAt: toISO(row.occurredAt),
      });
    }

    for (const row of dlcs) {
      items.push({
        id: `DLCAdded:${row.id}`,
        kind: "DLCAdded",
        gameType: "DLC",
        name: row.name,
        parentName: row.parentName,
        image: row.customImage ?? row.image,
        collectionId: row.collectionId,
        occurredAt: toISO(row.occurredAt),
      });
    }

    items.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    return res.status(200).json({ items: items.slice(0, LIMIT) });
  } catch (err) {
    req.log.error({ err }, "GET_HOME_ACTIVITY_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
