import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { playthrough, playthroughSession } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";

export const deletePlaythroughSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const playthroughId = req.playthrough!.id;
    const playthroughSessionId = req.playthroughSession!.id;

    const sessionSeconds = req.playthroughSession!.secondsPlayed;

    await db.transaction(async (tx) => {
      const deleted = await tx
        .delete(playthroughSession)
        .where(
          and(
            eq(playthroughSession.id, playthroughSessionId),
            eq(playthroughSession.playthroughId, playthroughId),
            eq(playthroughSession.userId, userId),
          ),
        )
        .returning({ id: playthroughSession.id });

      if (!deleted.length) {
        throw new Error("Session not found", { cause: 404 });
      }

      await tx
        .update(playthrough)
        .set({
          totalSeconds: sql`GREATEST(0, ${playthrough.totalSeconds} - ${sessionSeconds})`,
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
    if (e instanceof Error) {
      if (e.cause === 404) {
        return res.status(404).json({ error: e.message });
      }
    }

    return res.status(500).json({ error: GenericErrorMessage });
  }
};
