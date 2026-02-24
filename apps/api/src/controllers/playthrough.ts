import { db } from "@/db";
import { and, desc, eq, getTableColumns, inArray } from "drizzle-orm";

import type { Request, Response } from "express";

import { GenericErrorMessage } from "@/constants";
import { collection, dlc, playthrough, playthroughSession } from "@/db/schema";

export const getMany = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const playthroughs = await db
      .select({
        ...getTableColumns(playthrough),

        // from collection (game)
        gameName: collection.name,
        gameImage: collection.image,
        gameCustomImage: collection.customImage,
        gameCoverImage: collection.coverImage,
        gameCustomCoverImage: collection.customCoverImage,
        gamePlatform: collection.platform,
        gameProvider: collection.provider,

        // from dlc
        dlcName: dlc.name,
        dlcImage: dlc.image,
        dlcParentGameId: dlc.collectionId,
      })
      .from(playthrough)
      .leftJoin(collection, eq(collection.id, playthrough.collectionId))
      .leftJoin(dlc, eq(dlc.id, playthrough.dlcId))
      .where(eq(playthrough.userId, userId));

    const sessions = await db
      .select({
        id: playthroughSession.id,
        playthroughId: playthroughSession.playthroughId,
        playDate: playthroughSession.playDate,
        duration: playthroughSession.secondsPlayed,
        userId: playthroughSession.userId,
      })
      .from(playthroughSession)
      .where(eq(playthroughSession.userId, userId))
      .orderBy(desc(playthroughSession.playDate));

    const parentIds = [
      ...new Set(
        playthroughs
          .map((pt) => pt.dlcParentGameId)
          .filter((id): id is string => id !== null),
      ),
    ];

    const parentGames =
      parentIds.length > 0
        ? await db
            .select({
              id: collection.id,
              platform: collection.platform,
              provider: collection.provider,
            })
            .from(collection)
            .where(
              and(
                eq(collection.userId, userId),
                inArray(collection.id, parentIds),
              ),
            )
        : [];

    const parentMap = new Map(parentGames.map((g) => [g.id, g]));

    const sessionMap = new Map<string, typeof sessions>();

    for (const session of sessions) {
      if (!sessionMap.has(session.playthroughId)) {
        sessionMap.set(session.playthroughId, []);
      }
      sessionMap.get(session.playthroughId)!.push(session);
    }

    const result = playthroughs.map((pt) => {
      const isDLC = pt.dlcId !== null;

      let parentPlatform = pt.gamePlatform;
      let parentProvider = pt.gameProvider;

      if (isDLC) {
        if (!pt.dlcParentGameId) {
          throw new Error("DLC parent game missing");
        }

        const parentGame = parentMap.get(pt.dlcParentGameId);

        if (!parentGame) {
          throw new Error("Parent not found");
        }

        parentPlatform = parentGame.platform;
        parentProvider = parentGame.provider;
      }

      return {
        id: pt.id,
        collectionId: pt.collectionId,
        dlcId: pt.dlcId,
        userId: pt.userId,
        status: pt.status,
        notes: pt.notes,
        totalSeconds: pt.totalSeconds,
        startedAt: pt.startedAt,
        finishedAt: pt.finishedAt,
        createdAt: pt.createdAt,
        updatedAt: pt.updatedAt,

        gameType: isDLC ? "DLC" : "Game",

        name: isDLC ? pt.dlcName : pt.gameName,
        image: isDLC ? pt.dlcImage : pt.gameImage,
        customImage: isDLC ? pt.dlcImage : pt.gameCustomImage,
        coverImage: isDLC ? pt.dlcImage : pt.gameCoverImage,
        customCoverImage: isDLC ? pt.dlcImage : pt.gameCustomCoverImage,

        platform: isDLC ? parentPlatform : pt.gamePlatform,
        provider: isDLC ? parentProvider : pt.gameProvider,

        sessions: sessionMap.get(pt.id) ?? [],
      };
    });

    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
