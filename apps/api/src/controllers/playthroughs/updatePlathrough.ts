import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { playthrough } from "@/db/schema";
import { UpdatePlaythroughSchemaType } from "@repo/schemas/schemas/playthrough";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const updatePlaythrough = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const playthroughId = req.playthrough!.id;
    const { status, notes } = req.cleanBody as UpdatePlaythroughSchemaType;

    const [updated] = await db
      .update(playthrough)
      .set({ status, notes })
      .where(
        and(eq(playthrough.id, playthroughId), eq(playthrough.userId, userId)),
      )
      .returning({ id: playthrough.id });

    if (!updated) {
      return res.status(404).json({ error: "Playthrough not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "UPDATE_PLAYTHROUGH_STATUS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
