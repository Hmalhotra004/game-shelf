import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { casualSession } from "@/db/schema";
import { UpdateCasualSessionSchemaType } from "@repo/schemas/schemas/casualSession";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import lodash from "lodash";

export const updateCasualSession = async (req: Request, res: Response) => {
  try {
    const {
      playDate: date,
      secondsPlayed,
      notes,
    } = req.body as UpdateCasualSessionSchemaType;

    const playDate = new Date(date);

    if (lodash.isNaN(playDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    const casualSessionId = req.casualSession.id!;
    const userId = req.user!.id;

    const updated = await db
      .update(casualSession)
      .set({
        playDate,
        secondsPlayed,
        notes: notes ?? null,
      })
      .where(
        and(
          eq(casualSession.id, casualSessionId),
          eq(casualSession.userId, userId),
        ),
      )
      .returning({ id: casualSession.id });

    if (updated.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "CASUAL_UPDATE_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
