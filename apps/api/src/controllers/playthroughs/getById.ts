import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc, playthrough } from "@/db/schema";
import { GetByIdPlayQuerySchemaType } from "@repo/schemas/server/schemas/playthrough";
import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { Request, Response } from "express";

export const getByIdPlay = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const playthroughId = req.playthrough!.id;
    const { gameType } = req.cleanQuery as GetByIdPlayQuerySchemaType;

    let row;

    if (gameType === "Game") {
      [row] = await db
        .select({
          ...getTableColumns(playthrough),
          // display info comes from the game itself
          name: collection.name,
          dlcName: sql<string | null>`NULL`,
          image: collection.image,
          customImage: collection.customImage,
          coverImage: collection.coverImage,
          customCoverImage: collection.customCoverImage,
          platform: collection.platform,
          provider: collection.provider,
          PSVersion: collection.PSVersion,
        })
        .from(playthrough)
        .innerJoin(collection, eq(collection.id, playthrough.collectionId))
        .where(
          and(
            eq(playthrough.id, playthroughId),
            eq(playthrough.userId, userId),
          ),
        )
        .limit(1);
    } else {
      [row] = await db
        .select({
          ...getTableColumns(playthrough),
          // DLC uses its own images; platform / provider come from the parent game
          name: collection.name,
          dlcName: dlc.name,
          image: dlc.image,
          customImage: dlc.customImage,
          coverImage: dlc.coverImage,
          customCoverImage: dlc.customCoverImage,
          platform: collection.platform,
          provider: collection.provider,
          PSVersion: collection.PSVersion,
        })
        .from(playthrough)
        .innerJoin(dlc, eq(dlc.id, playthrough.dlcId))
        .innerJoin(collection, eq(collection.id, dlc.collectionId))
        .where(
          and(
            eq(playthrough.id, playthroughId),
            eq(playthrough.userId, userId),
          ),
        )
        .limit(1);
    }

    if (!row) return res.status(404).json({ error: "Playthrough not found" });

    return res.status(200).json(row);
  } catch (err) {
    req.log.error({ err }, "GET_BY_ID_PLAYTHROUGH_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
