import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc, playthrough } from "@/db/schema";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Request, Response } from "express";

import {
  getOnlineSteamPlaySecs,
  getSteamPlaytimeByAppId,
  needsSteamPlaytime,
} from "@/lib/steam/onlinePlaytime";

export const getOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const steamId = req.user!.steamId;

    const parent = alias(collection, "parent_collection");

    const [gamesAgg] = await db
      .select({
        totalGames: sql<number>`count(*)`,
        spentOnGames: sql<number>`coalesce(sum(${collection.amount}), 0)`,
      })
      .from(collection)
      .where(
        and(eq(collection.userId, userId), eq(collection.archived, false)),
      );

    const [dlcAgg] = await db
      .select({
        totalDLCs: sql<number>`count(*)`,
        spentOnDLCs: sql<number>`coalesce(sum(${dlc.amount}), 0)`,
      })
      .from(dlc)
      .innerJoin(collection, eq(collection.id, dlc.collectionId))
      .where(
        and(
          eq(dlc.userId, userId),
          eq(dlc.archived, false),
          eq(collection.archived, false),
        ),
      );

    const [activePlaythroughs] = await db
      .select({
        count: sql<number>`count(*)`,
        seconds: sql<number>`coalesce(sum(${playthrough.totalSeconds}),0)`,
      })
      .from(playthrough)
      .leftJoin(collection, eq(collection.id, playthrough.collectionId))
      .leftJoin(dlc, eq(dlc.id, playthrough.dlcId))
      .leftJoin(parent, eq(parent.id, dlc.collectionId))
      .where(
        and(
          eq(playthrough.userId, userId),
          eq(playthrough.status, "Active"),
          or(isNull(collection.id), eq(collection.archived, false)),
          or(isNull(dlc.id), eq(dlc.archived, false)),
          or(isNull(parent.id), eq(parent.archived, false)),
        ),
      );

    const [completedAgg] = await db
      .select({
        count: sql<number>`count(*)`,
        seconds: sql<number>`coalesce(sum(${completion.totalPlaytime}), 0)`,
      })
      .from(completion)
      .leftJoin(dlc, eq(dlc.id, completion.dlcId))
      .leftJoin(
        parent,
        eq(
          parent.id,
          sql`COALESCE(${completion.collectionId}, ${dlc.collectionId})`,
        ),
      )
      .where(
        and(
          eq(completion.userId, userId),
          eq(parent.archived, false),
          or(isNull(dlc.id), eq(dlc.archived, false)),
        ),
      );

    /* ------------------ ONLINE HOURS ------------------ */
    // TODO: add psn online hrs

    const onlineGames = await db
      .select({
        provider: collection.provider,
        status: collection.status,
        steamAppId: collection.steamAppId,
      })
      .from(collection)
      .where(
        and(
          eq(collection.userId, userId),
          eq(collection.status, "Online"),
          eq(collection.archived, false),
        ),
      );

    const steamOnline = onlineGames.filter(needsSteamPlaytime);

    const playtimeByAppId = steamOnline.length
      ? await getSteamPlaytimeByAppId(steamId, req.log)
      : {};

    // dedupe by appId so the same game isn't counted twice
    const seen = new Set<string>();
    let onlineSeconds = 0;
    for (const g of steamOnline) {
      const id = String(g.steamAppId);
      if (seen.has(id)) continue;
      seen.add(id);
      onlineSeconds += getOnlineSteamPlaySecs(g, playtimeByAppId);
    }

    const activeSeconds = Number(activePlaythroughs.seconds ?? 0);
    const completedSeconds = Number(completedAgg.seconds ?? 0);

    return res.status(200).json({
      totalGames: Number(gamesAgg.totalGames),
      totalDLCs: Number(dlcAgg.totalDLCs),
      totalPlaytimeHours: Math.round(
        (activeSeconds + completedSeconds + onlineSeconds) / 3600,
      ),
      totalSpent: Number(gamesAgg.spentOnGames) + Number(dlcAgg.spentOnDLCs),
      activePlaythroughs: Number(activePlaythroughs.count),
      completedGames: Number(completedAgg.count),
    });
  } catch (err) {
    req.log.error({ err }, "GET_HOME_OVERVIEW_STATS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
