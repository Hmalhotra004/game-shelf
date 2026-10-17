import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";

export const deleteCompletion = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const completionId = req.completion!.id;

    const deleted = await db.transaction(async (tx) => {
      const [row] = await tx
        .delete(completion)
        .where(
          and(eq(completion.id, completionId), eq(completion.userId, userId)),
        )
        .returning({
          collectionId: completion.collectionId,
          dlcId: completion.dlcId,
        });

      if (!row) return null;

      // ---------- game completion ----------
      if (row.collectionId) {
        // subtract one from the stored counter (never below 0)
        const [updated] = await tx
          .update(collection)
          .set({ completions: sql`GREATEST(${collection.completions} - 1, 0)` })
          .where(
            and(
              eq(collection.id, row.collectionId),
              eq(collection.userId, userId),
            ),
          )
          .returning({ completions: collection.completions });

        if (updated && updated.completions === 0) {
          await tx
            .update(collection)
            .set({ status: "Backlog" })
            .where(
              and(
                eq(collection.id, row.collectionId),
                eq(collection.userId, userId),
              ),
            );
        }
      }

      // ---------- dlc completion ----------
      if (row.dlcId) {
        const [updated] = await tx
          .update(dlc)
          .set({ completions: sql`GREATEST(${dlc.completions} - 1, 0)` })
          .where(and(eq(dlc.id, row.dlcId), eq(dlc.userId, userId)))
          .returning({ completions: dlc.completions });

        if (updated && updated.completions === 0) {
          await tx
            .update(dlc)
            .set({ status: "Backlog" })
            .where(and(eq(dlc.id, row.dlcId), eq(dlc.userId, userId)));
        }
      }

      return row;
    });

    if (!deleted)
      return res.status(404).json({ error: "Completion not found" });

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "DELETE_COMPLETION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
