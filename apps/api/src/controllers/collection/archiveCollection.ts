import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";
import type { Request, Response } from "express";

export const archiveCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;

    const [updated] = await db
      .update(collection)
      .set({ archived: not(collection.archived) })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      )
      .returning({ id: collection.id, archived: collection.archived });

    if (!updated) return res.status(404).json({ error: "Game not found" });

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "DELETE_COLLECION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
