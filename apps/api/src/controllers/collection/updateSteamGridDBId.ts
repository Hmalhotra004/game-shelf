import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const updateSteamGridDBId = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;
    const steamGridDBId = req.params.steamGridDBId as string | null;

    if (!steamGridDBId)
      return res.status(400).json({ error: "steamGridDBId is required" });

    await db
      .update(collection)
      .set({ steamGridDBId })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
