import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { completion } from "@/db/schema";
import { UpdateCompletionSchemaType } from "@repo/schemas/server/schemas/completion";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const editCompletion = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const completionId = req.completion!.id;

    const { completedAt, completionStyle, notes, totalPlaytime } =
      req.cleanBody as UpdateCompletionSchemaType;

    const [updated] = await db
      .update(completion)
      .set({
        completedAt: completedAt ? new Date(completedAt) : null,
        completionStyle,
        notes,
        totalPlaytime,
      })
      .where(
        and(eq(completion.id, completionId), eq(completion.userId, userId)),
      )
      .returning({ id: completion.id });

    if (!updated)
      return res.status(404).json({ error: "Completion not found" });

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "EDIT_COMPLETION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
