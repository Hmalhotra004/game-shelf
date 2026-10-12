import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc } from "@/db/schema";
import { GameInfoCompletionQuerySchema } from "@repo/schemas/server/schemas/completion";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const getGameInfoForCompletion = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { gameType, id } = req.cleanQuery as GameInfoCompletionQuerySchema;

    let game;

    if (gameType === "Game") {
      game = await db.query.collection.findFirst({
        where: (c, { and, eq }) => and(eq(c.id, id), eq(c.userId, userId)),
        columns: {
          id: true,
          igdbId: true,
          image: true,
          customImage: true,
          coverImage: true,
          customCoverImage: true,
          platform: true,
          provider: true,
          PSVersion: true,
        },
      });
    } else {
      [game] = await db
        .select({
          id: dlc.id,
          igdbId: dlc.igdbId,
          image: dlc.image,
          customImage: dlc.customImage,
          coverImage: dlc.coverImage,
          customCoverImage: dlc.customCoverImage,

          platform: collection.platform,
          provider: collection.provider,
          PSVersion: collection.PSVersion,
        })
        .from(dlc)
        .innerJoin(collection, eq(dlc.collectionId, collection.id))
        .where(and(eq(dlc.id, id), eq(collection.userId, userId)))
        .limit(1);
    }

    if (!game) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.status(200).json(game);
  } catch (err) {
    req.log.error({ err }, "COMPLETION_GET_GAME_INFO_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
