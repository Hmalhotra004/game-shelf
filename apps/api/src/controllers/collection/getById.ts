import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { completion, dlc, list, listItem, playthrough } from "@/db/schema";
import type { GetOwnedGamesSteamType } from "@repo/schemas/types/steam";
import axios from "axios";
import { and, eq, ne, sql } from "drizzle-orm";
import type { Request, Response } from "express";

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
  } catch (err) {
    req.log.error({ err }, "COLLECTION_GET_BY_ID_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
