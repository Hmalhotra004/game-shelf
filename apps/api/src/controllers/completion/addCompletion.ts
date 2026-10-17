import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc, playthrough } from "@/db/schema";
import { CreateCompletionSchemaType } from "@repo/schemas/server/schemas/completion";
import { and, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";

export const addCompletion = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const data = req.cleanBody as CreateCompletionSchemaType;

    const result = await db.transaction(async (tx) => {
      const isDLC = data.gameType === "DLC";

      // Verify the target belongs to the user
      if (isDLC) {
        const [existingDlc] = await tx
          .select({ id: dlc.id })
          .from(dlc)
          .where(and(eq(dlc.id, data.dlcId!), eq(dlc.userId, userId)));

        if (!existingDlc) return null;
      } else {
        const [existingGame] = await tx
          .select({ id: collection.id })
          .from(collection)
          .where(
            and(
              eq(collection.id, data.collectionId!),
              eq(collection.userId, userId),
            ),
          );

        if (!existingGame) return null;
      }

      // Verify the playthrough belongs to the user AND to this same game / dlc
      if (data.playthroughId) {
        const [existingPlaythrough] = await tx
          .select({ id: playthrough.id })
          .from(playthrough)
          .where(
            and(
              eq(playthrough.id, data.playthroughId),
              eq(playthrough.userId, userId),
              isDLC
                ? eq(playthrough.dlcId, data.dlcId!)
                : eq(playthrough.collectionId, data.collectionId!),
            ),
          );

        if (!existingPlaythrough) return "PLAYTHROUGH_NOT_FOUND" as const;
      }

      const [created] = await tx
        .insert(completion)
        .values({
          gameType: data.gameType,
          completionStyle: data.completionStyle,
          totalPlaytime: data.totalPlaytime,
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
          notes: data.notes,
          platform: data.platform,
          PSVersion: data.platform === "PS" ? data.PSVersion : null,
          collectionId: isDLC ? null : data.collectionId!,
          dlcId: isDLC ? data.dlcId! : null,
          userId,
        })
        .returning();

      // Keep the parent's completion count + status in sync
      if (isDLC) {
        await tx
          .update(dlc)
          .set({
            completions: sql`${dlc.completions} + 1`,
            status: data.completionStatus,
          })
          .where(and(eq(dlc.id, data.dlcId!), eq(dlc.userId, userId)));
      } else {
        await tx
          .update(collection)
          .set({
            completions: sql`${collection.completions} + 1`,
            status: data.completionStatus,
          })
          .where(
            and(
              eq(collection.id, data.collectionId!),
              eq(collection.userId, userId),
            ),
          );
      }

      if (data.playthroughId) {
        await tx
          .update(playthrough)
          .set({ status: "Completed", completionId: created.id })
          .where(
            and(
              eq(playthrough.id, data.playthroughId),
              eq(playthrough.userId, userId),
            ),
          );
      }

      return created;
    });

    if (!result) {
      return res.status(404).json({
        error: data.gameType === "DLC" ? "DLC not found" : "Game not found",
      });
    }

    return res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "COMPLETION_ADD_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
