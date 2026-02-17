import { db } from "@/db";
import axios from "axios";
import { and, eq, ne, sql } from "drizzle-orm";

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
import {
  ExternalIdsSchemaType,
  UpdateImagesSchemaType,
} from "@repo/schemas/schemas/collection";

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

export const getById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const steamId = req.user!.steamId;
    const game = req.collection!;
    const collectionId = game.id;

    // ----------------------------
    // PARALLEL DB QUERIES
    // ----------------------------
    const [
      listRows,
      dlcs,
      gamePlaythroughAgg,
      gameCompletionAgg,
      dlcPlaythroughAgg,
      dlcCompletionAgg,
      steamResponse,
    ] = await Promise.all([
      // -------- LISTS --------
      db
        .select({ id: list.id, name: list.name })
        .from(listItem)
        .innerJoin(list, eq(list.id, listItem.listId))
        .where(
          and(eq(listItem.collectionId, collectionId), eq(list.userId, userId)),
        ),

      // -------- DLCs --------
      db
        .select({
          id: dlc.id,
          name: dlc.name,
          dateOfPurchase: dlc.dateOfPurchase,
          amount: dlc.amount,
          image: dlc.image,
          coverImage: dlc.coverImage,
          completions: dlc.completions,
          status: dlc.status,
          ownershipType: dlc.ownershipType,
          npCommunicationId: dlc.npCommunicationId,
          steamAppId: dlc.steamAppId,
          collectionId: dlc.collectionId,
        })
        .from(dlc)
        .where(and(eq(dlc.collectionId, collectionId), eq(dlc.userId, userId))),

      // -------- GAME PLAYTHROUGH SUM --------
      db
        .select({
          total: sql<number>`COALESCE(SUM(${playthrough.totalSeconds}), 0)`,
        })
        .from(playthrough)
        .where(
          and(
            eq(playthrough.userId, userId),
            eq(playthrough.collectionId, collectionId),
            ne(playthrough.status, "Archived"),
          ),
        ),

      // -------- GAME COMPLETION SUM --------
      db
        .select({
          total: sql<number>`COALESCE(SUM(${completion.totalPlaytime}), 0)`,
        })
        .from(completion)
        .where(
          and(
            eq(completion.userId, userId),
            eq(completion.collectionId, collectionId),
          ),
        ),

      // -------- DLC PLAYTHROUGH GROUPED --------
      db
        .select({
          dlcId: playthrough.dlcId,
          total: sql<number>`COALESCE(SUM(${playthrough.totalSeconds}), 0)`,
        })
        .from(playthrough)
        .where(
          and(
            eq(playthrough.userId, userId),
            eq(playthrough.collectionId, collectionId),
            ne(playthrough.status, "Archived"),
          ),
        )
        .groupBy(playthrough.dlcId),

      // -------- DLC COMPLETION GROUPED --------
      db
        .select({
          dlcId: completion.dlcId,
          total: sql<number>`COALESCE(SUM(${completion.totalPlaytime}), 0)`,
        })
        .from(completion)
        .where(
          and(
            eq(completion.userId, userId),
            eq(completion.collectionId, collectionId),
          ),
        )
        .groupBy(completion.dlcId),

      // -------- STEAM (only if needed) --------
      game.status === "Online" && game.provider === "Steam" && steamId
        ? axios.get<GetOwnedGamesSteamType>(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`,
            {
              params: {
                key: process.env.STEAM_TOKEN,
                steamid: steamId,
                format: "json",
                include_appinfo: false,
              },
            },
          )
        : Promise.resolve(null),
    ]);

    // ----------------------------
    // STEAM PLAYTIME
    // ----------------------------
    let onlinePlaySecs = 0;

    if (steamResponse) {
      const steamGames = steamResponse.data.response.games ?? [];

      const steamMinutes =
        steamGames.find((g) => String(g.appid) === game.steamAppId)
          ?.playtime_forever ?? 0;

      onlinePlaySecs = steamMinutes * 60;
    }

    // ----------------------------
    // DLC TIME MERGE (O(n))
    // ----------------------------
    const playMap = new Map(dlcPlaythroughAgg.map((d) => [d.dlcId, d.total]));
    const completionMap = new Map(
      dlcCompletionAgg.map((d) => [d.dlcId, d.total]),
    );

    const dlcsWithTime = dlcs.map((d) => {
      const play = playMap.get(d.id) ?? 0;
      const comp = completionMap.get(d.id) ?? 0;

      return {
        ...d,
        totalTime: play + comp,
      };
    });

    const gamePlaythroughTime = gamePlaythroughAgg[0].total;
    const gameCompletionTime = gameCompletionAgg[0].total;

    return res.status(200).json({
      ...game,
      id: game.id,
      name: game.name,
      edition: game.edition,
      dateOfPurchase: game.dateOfPurchase,
      amount: game.amount,
      image: game.image,
      customImage: game.customImage,
      coverImage: game.coverImage,
      customCoverImage: game.customCoverImage,
      completions: game.completions,
      platform: game.platform,
      provider: game.provider,
      PSVersion: game.PSVersion,
      status: game.status,
      ownershipType: game.ownershipType,
      npCommunicationId: game.npCommunicationId,
      steamAppId: game.steamAppId,
      steamGridDBId: game.steamGridDBId,
      dlcCount: game.dlcCount,
      lists: listRows,
      dlcs: dlcsWithTime,
      onlinePlaySecs,
      totalTime: gamePlaythroughTime + gameCompletionTime,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const update = async (req: Request, res: Response) => {};

export const updateSteamGridDBId = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;
    const steamGridDBId = req.params.steamGridDBId as string | null;

    if (!steamGridDBId)
      return res.status(400).json({ error: "steamGridDBId is required" });

    await db
      .update(collection)
      .set({ steamGridDBId })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateExternalIds = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;
    const { npCommunicationId, steamAppId } =
      req.cleanBody as ExternalIdsSchemaType;

    await db
      .update(collection)
      .set({
        npCommunicationId,
        steamAppId,
      })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateImages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;
    const { customCoverImage, customImage } =
      req.cleanBody as UpdateImagesSchemaType;

    await db
      .update(collection)
      .set({ customImage, customCoverImage })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
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
