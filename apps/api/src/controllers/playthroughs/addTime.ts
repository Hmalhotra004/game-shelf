import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { playthrough, playthroughSession } from "@/db/schema";
import { CreatePlaythroughSessionSchemaType } from "@repo/schemas/schemas/playthrough";
import { and, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import lodash from "lodash";

export const addTime = async (req: Request, res: Response) => {
  try {
    const { playDate: date, secondsPlayed } =
      req.body as CreatePlaythroughSessionSchemaType;

    if (secondsPlayed <= 0) {
      return res.status(400).json({ error: "Invalid playtime" });
    }

    const playDate = date ? new Date(date) : new Date();

    if (lodash.isNaN(playDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    const userId = req.user!.id;
    const playthroughId = req.playthrough!.id;

    await db.transaction(async (tx) => {
      await tx.insert(playthroughSession).values({
        playDate,
        playthroughId,
        secondsPlayed,
        userId,
      });

      await tx
        .update(playthrough)
        .set({
          finishedAt: playDate,
          totalSeconds: sql`${playthrough.totalSeconds} + ${secondsPlayed}`,
          status: "Active",
        })
        .where(
          and(
            eq(playthrough.id, playthroughId),
            eq(playthrough.userId, userId),
          ),
        );
    });

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
