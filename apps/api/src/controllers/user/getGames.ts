import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const getGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const games = await db.query.collection.findMany({
      columns: {
        id: true,
        name: true,
        image: true,
        coverImage: true,
        customImage: true,
        customCoverImage: true,
        platform: true,
        provider: true,
        igdbId: true,
      },
      where: (c, { eq, and }) =>
        and(eq(c.userId, userId), eq(c.archived, false)),
      orderBy: (c, { asc }) => asc(c.name),
    });

    const dlcs = await db
      .select({
        id: dlc.id,
        collectionId: dlc.collectionId,
        name: dlc.name,
        image: dlc.image,
        coverImage: dlc.coverImage,
        igdbId: dlc.igdbId,
        platform: collection.platform,
        provider: collection.provider,
      })
      .from(dlc)
      .innerJoin(collection, eq(dlc.collectionId, collection.id))
      .where(and(eq(dlc.userId, userId), eq(collection.archived, false)))
      .orderBy(asc(dlc.name));

    return res.status(200).json({
      games,
      dlcs,
    });
  } catch (err) {
    req.log.error({ err }, "GET_USER_GAMES_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
