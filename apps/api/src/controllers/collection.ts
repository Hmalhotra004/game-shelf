import { db } from "@/db";
import axios from "axios";
import { and, eq, sql } from "drizzle-orm";

import type { GetOwnedGamesSteamType } from "@repo/schemas/types/steam";
import type { Request, Response } from "express";

import {
  collection,
  completion,
  dlc,
  list,
  listItem,
  playthrough,
} from "@/db/schema";

export const getMany = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const games = await db.query.collection.findMany({
      where: (c, { eq }) => eq(c.userId, userId),
      orderBy: (c, { asc }) => asc(c.name),
      columns: {
        id: true,
        name: true,
        amount: true,
        image: true,
        customImage: true,
        platform: true,
        provider: true,
        status: true,
        dlcCount: true,
        dateOfPurchase: true,
        completions: true,
        steamAppId: true,
      },
    });

    const lists = await db
      .select({
        collectionId: listItem.collectionId,
        name: sql<string[]>`
      array_agg(${list.name})
    `,
      })
      .from(listItem)
      .innerJoin(list, eq(list.id, listItem.listId))
      .where(eq(list.userId, userId))
      .groupBy(listItem.collectionId);

    const totals = await db
      .select({
        collectionId: collection.id,
        totalPlaytime: sql<number>`
          COALESCE(SUM(${playthrough.totalSeconds}), 0)
          +
          COALESCE(SUM(${completion.totalPlaytime}), 0)
        `,
        totalAmount: sql<string>`
          COALESCE(${collection.amount}, 0)
          +
          COALESCE(SUM(${dlc.amount}), 0)
        `,
      })
      .from(collection)
      .leftJoin(playthrough, eq(playthrough.collectionId, collection.id))
      .leftJoin(completion, eq(completion.collectionId, collection.id))
      .leftJoin(dlc, eq(dlc.collectionId, collection.id))
      .where(eq(collection.userId, userId))
      .groupBy(collection.id);

    // online games
    const needsSteamPlaytime = games.some(
      (g) => g.provider === "Steam" && g.status === "Online" && g.steamAppId,
    );

    let steamPlaytimeByAppId: Record<number, number> = {};
    if (needsSteamPlaytime && req.user?.steamId) {
      const response = await axios.get<GetOwnedGamesSteamType>(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
        {
          params: {
            key: process.env.STEAM_TOKEN,
            steamid: req.user.steamId,
            format: "json",
            include_appinfo: false,
          },
          timeout: 5000,
        },
      );

      const steamGames = response.data.response.games ?? [];

      // minutes → seconds (store seconds directly)
      steamPlaytimeByAppId = Object.fromEntries(
        steamGames.map((g) => [g.appid, g.playtime_forever * 60]),
      );
    }

    const totalsByGameId = Object.fromEntries(
      totals.map((t) => [t.collectionId, t]),
    );

    const listsByGameId = Object.fromEntries(
      lists.map((l) => [l.collectionId, l.name ?? []]),
    );

    const result = games.map((g) => {
      const t = totalsByGameId[g.id];

      let onlinePlaySecs = 0;

      if (g.provider === "Steam" && g.status === "Online" && g.steamAppId) {
        onlinePlaySecs = steamPlaytimeByAppId[Number(g.steamAppId)] ?? 0;
      }

      return {
        ...g,
        listIds: listsByGameId[g.id] ?? [],
        totalAmount: Number(t?.totalAmount ?? 0),
        totalPlaytime: t?.totalPlaytime ?? 0,
        onlinePlaySecs,
      };
    });

    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;

    const [deleted] = await db
      .delete(collection)
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      )
      .returning();

    if (!deleted) return res.status(404).json({ error: "Game not found" });

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
