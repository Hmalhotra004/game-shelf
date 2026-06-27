import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;

    const [deleted] = await db
      .delete(collection)
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      )
      .returning();

    if (!deleted) return res.status(404).json({ error: "Game not found" });

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
