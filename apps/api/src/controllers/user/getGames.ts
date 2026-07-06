import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import type { Request, Response } from "express";

export const getGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const games = await db.query.collection.findMany({
      columns: {
        id: true,
        name: true,
        image: true,
        customImage: true,
        platform: true,
        provider: true,
      },
      where: (c, { eq }) => eq(c.userId, userId),
    });

    const dlcs = await db.query.dlc.findMany({
      columns: {
        id: true,
        collectionId: true,
        name: true,
        image: true,
      },
      where: (d, { eq }) => eq(d.userId, userId),
    });

    return res.status(200).json({
      games,
      dlcs,
    });
  } catch (err) {
    req.log.error({ err }, "GET_USER_GAMES_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
