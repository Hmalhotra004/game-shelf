import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { playthrough } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const deletePlaythrough = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const playthroughId = req.playthrough!.id;

    await db
      .delete(playthrough)
      .where(
        and(eq(playthrough.id, playthroughId), eq(playthrough.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
