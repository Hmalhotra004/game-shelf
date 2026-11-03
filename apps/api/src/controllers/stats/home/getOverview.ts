import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc, playthrough } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
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
      .where(and(eq(dlc.userId, userId), eq(dlc.archived, false)));

    const [activePlaythroughs] = await db
      .select({
        count: sql<number>`count(*)`,
        seconds: sql<number>`coalesce(sum(${playthrough.totalSeconds}),0)`,
      })
      .from(playthrough)
      .where(
        and(eq(playthrough.userId, userId), eq(playthrough.status, "Active")),
      );

    const [completedAgg] = await db
      .select({
        count: sql<number>`count(*)`,
        seconds: sql<number>`coalesce(sum(${completion.totalPlaytime}), 0)`,
      })
      .from(completion)
      .where(eq(completion.userId, userId));

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
