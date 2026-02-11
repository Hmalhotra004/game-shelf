import { db } from "@/db";
import { GetOwnedGamesSteamType } from "@repo/schemas/types/steam";
import axios from "axios";
import { and, eq, sql } from "drizzle-orm";

import { collection, completion, dlc, playthrough } from "@/db/schema";

import type { Request, Response } from "express";

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const steamId = req.user!.steamId;

    const [gamesAgg] = await db
      .select({
        totalGames: sql<number>`count(*)`,
        spentOnGames: sql<number>`coalesce(sum(${collection.amount}), 0)`,
      })
      .from(collection)
      .where(and(eq(collection.userId, userId), eq(collection.hidden, false)));

    const [dlcAgg] = await db
      .select({
        totalDLCs: sql<number>`count(*)`,
        spentOnDLCs: sql<number>`coalesce(sum(${dlc.amount}), 0)`,
      })
      .from(dlc)
      .where(and(eq(dlc.userId, userId), eq(dlc.hidden, false)));

    // const [activePlaytime] = await db
    //   .select({
    //     seconds: sql<number>`coalesce(sum(${playthroughSession.secondsPlayed}), 0)`,
    //   })
    //   .from(playthroughSession)
    //   .where(eq(playthroughSession.userId, userId));

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

    /* ------------------ PIE CHARTS ------------------ */

    const statusDistribution = await db
      .select({
        label: collection.status,
        value: sql<number>`count(*)`,
      })
      .from(collection)
      .where(and(eq(collection.userId, userId), eq(collection.hidden, false)))
      .groupBy(collection.status);

    const platformDistribution = await db
      .select({
        label: collection.platform,
        value: sql<number>`count(*)`,
      })
      .from(collection)
      .where(and(eq(collection.userId, userId), eq(collection.hidden, false)))
      .groupBy(collection.platform);

    const providerDistribution = await db
      .select({
        label: collection.provider,
        value: sql<number>`count(*)`,
      })
      .from(collection)
      .where(and(eq(collection.userId, userId), eq(collection.hidden, false)))
      .groupBy(collection.provider);

    const completionStyleDistribution = await db
      .select({
        label: completion.completionStyle,
        value: sql<number>`count(*)`,
      })
      .from(completion)
      .where(eq(completion.userId, userId))
      .groupBy(completion.completionStyle);

    /* ------------------ LINE / BAR CHARTS ------------------ */

    // TODO
    // const playtimeByDate = await db
    //   .select({
    //     date: sql<string>`to_char(${playthroughSession.playDate}, 'YYYY-MM-DD')`,
    //     hours: sql<number>`sum(${playthroughSession.secondsPlayed}) / 3600`,
    //   })
    //   .from(playthroughSession)
    //   .where(eq(playthroughSession.userId, userId))
    //   .groupBy(playthroughSession.playDate)
    //   .orderBy(playthroughSession.playDate);

    // const purchasesByMonth = await db
    //   .select({
    //     month: sql<string>`to_char(${collection.dateOfPurchase}, 'YYYY-MM')`,
    //     games: sql<number>`count(*)`,
    //     amount: sql<number>`sum(${collection.amount})`,
    //   })
    //   .from(collection)
    //   .where(and(eq(collection.userId, userId), eq(collection.hidden, false)))
    //   .groupBy(sql`to_char(${collection.dateOfPurchase}, 'YYYY-MM')`)
    //   .orderBy(sql`to_char(${collection.dateOfPurchase}, 'YYYY-MM')`);

    /* ------------------ ONLINE HOURS ------------------ */
    //TODO add psn online hrs
    const onlineGames = await db
      .select({ steamId: collection.steamAppId })
      .from(collection)
      .where(
        and(eq(collection.userId, userId), eq(collection.status, "Online")),
      );

    let onlineMins = 0;

    if (onlineGames.length > 0 && steamId) {
      const response = await axios.get<GetOwnedGamesSteamType>(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`,
        {
          params: {
            key: process.env.STEAM_TOKEN,
            steamid: steamId,
            format: "json",
            include_appinfo: true,
          },
        },
      );

      const steamGames = response.data.response.games ?? [];

      const neededAppIds = new Set(onlineGames.map((g) => g.steamId));

      for (const game of steamGames) {
        if (neededAppIds.has(String(game.appid))) {
          onlineMins += game.playtime_forever ?? 0;
        }
      }
    }

    const activeSeconds = Number(activePlaythroughs.seconds ?? 0);
    const completedSeconds = Number(completedAgg.seconds ?? 0);
    const onlineSeconds = onlineMins * 60;

    return res.status(200).json({
      overview: {
        totalGames: Number(gamesAgg.totalGames),
        totalDLCs: Number(dlcAgg.totalDLCs),
        totalPlaytimeHours: Math.round(
          (activeSeconds + completedSeconds + onlineSeconds) / 3600,
        ),
        totalSpent: Number(gamesAgg.spentOnGames) + Number(dlcAgg.spentOnDLCs),
        activePlaythroughs: Number(activePlaythroughs.count),
        completedGames: Number(completedAgg.count),
      },

      statusDistribution,
      platformDistribution,
      providerDistribution,
      completionStyleDistribution,

      // playtimeByDate,
      // purchasesByMonth,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
