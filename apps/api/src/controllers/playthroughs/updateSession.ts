import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { playthrough, playthroughSession } from "@/db/schema";
import { UpdatePlaythroughSessionSchemaType } from "@repo/schemas/schemas/playthrough";
import { and, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import lodash from "lodash";

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { playDate: date, secondsPlayed } =
      req.body as UpdatePlaythroughSessionSchemaType;

    if (!Number.isInteger(secondsPlayed) || secondsPlayed <= 0) {
      return res.status(400).json({ error: "Invalid playtime" });
    }

    const playDate = new Date(date);

    if (lodash.isNaN(playDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    const userId = req.user!.id;
    const playthroughId = req.playthrough!.id;
    const playthroughSessionId = req.playthroughSession!.id;

    const found = await db.transaction(async (tx) => {
      const sessionWhere = and(
        eq(playthroughSession.id, playthroughSessionId),
        eq(playthroughSession.playthroughId, playthroughId),
        eq(playthroughSession.userId, userId),
      );

      // lock the row so concurrent edits can't double-apply the time diff
      const [existing] = await tx
        .select({ secondsPlayed: playthroughSession.secondsPlayed })
        .from(playthroughSession)
        .where(sessionWhere)
        .for("update");

      if (!existing) return false;

      const diff = secondsPlayed - existing.secondsPlayed;

      await tx
        .update(playthroughSession)
        .set({ playDate, secondsPlayed })
        .where(sessionWhere);

      if (diff !== 0) {
        await tx
          .update(playthrough)
          .set({
            totalSeconds: sql`GREATEST(${playthrough.totalSeconds} + ${diff}, 0)`,
          })
          .where(
            and(
              eq(playthrough.id, playthroughId),
              eq(playthrough.userId, userId),
            ),
          );
      }

      return true;
    });

    if (!found) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "PLAYTHROUGH_UPDATE_SESSION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
