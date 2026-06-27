import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc, playthrough } from "@/db/schema";
import { CreatePlaythroughSchemaType } from "@repo/schemas/schemas/playthrough";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const add = async (req: Request, res: Response) => {
  try {
    const { gameType, collectionId, dlcId } =
      req.cleanBody as CreatePlaythroughSchemaType;

    const userId = req.user!.id;

    const id = gameType === "Game" ? collectionId : dlcId;

    if (!id) {
      return res.status(400).json({
        error: `${gameType} is required`,
      });
    }

    await db.transaction(async (tx) => {
      if (gameType === "Game") {
        const game = await tx.query.collection.findFirst({
          where: (c, { and, eq }) => and(eq(c.id, id), eq(c.userId, userId)),
          columns: { id: true },
        });

        if (!game) {
          throw new Error("Game not found", { cause: 404 });
        }

        await tx.insert(playthrough).values({
          userId,
          gameType,
          collectionId: id,
        });

        await tx
          .update(collection)
          .set({ status: "Playing" })
          .where(and(eq(collection.id, id), eq(collection.userId, userId)));
      }

      if (gameType === "DLC") {
        const dlcExists = await tx.query.dlc.findFirst({
          where: (d, { and, eq }) => and(eq(d.id, id), eq(d.userId, userId)),
          columns: { id: true },
        });

        if (!dlcExists) {
          throw new Error("DLC not found", { cause: 404 });
        }

        await tx.insert(playthrough).values({
          userId,
          gameType,
          dlcId: id,
        });

        await tx
          .update(dlc)
          .set({ status: "Playing" })
          .where(and(eq(dlc.id, id), eq(dlc.userId, userId)));
      }
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
