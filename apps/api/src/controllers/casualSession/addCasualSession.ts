import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { casualSession, collection, dlc } from "@/db/schema";
import { CreateCasualSessionSchemaType } from "@repo/schemas/schemas/casualSession";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import lodash from "lodash";

export const addCasualSession = async (req: Request, res: Response) => {
  try {
    const {
      playDate: date,
      secondsPlayed,
      gameType,
      notes,
      collectionId,
      dlcId,
    } = req.body as CreateCasualSessionSchemaType;

    if (secondsPlayed <= 0) {
      return res.status(400).json({ error: "Invalid playtime" });
    }

    const playDate = date ? new Date(date) : new Date();

    if (lodash.isNaN(playDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    const userId = req.user!.id;

    if (gameType === "Game") {
      if (!collectionId) {
        return res.status(400).json({ error: "collectionId is required" });
      }

      const [owned] = await db
        .select({ id: collection.id })
        .from(collection)
        .where(
          and(eq(collection.id, collectionId), eq(collection.userId, userId)),
        )
        .limit(1);

      if (!owned) {
        return res.status(404).json({ error: "Game not found" });
      }
    } else {
      if (!dlcId) {
        return res.status(400).json({ error: "dlcId is required" });
      }

      const [owned] = await db
        .select({ id: dlc.id })
        .from(dlc)
        .where(and(eq(dlc.id, dlcId), eq(dlc.userId, userId)))
        .limit(1);

      if (!owned) {
        return res.status(404).json({ error: "DLC not found" });
      }
    }

    await db.insert(casualSession).values({
      gameType,
      playDate,
      secondsPlayed,
      notes: notes ?? null,
      collectionId: gameType === "Game" ? collectionId : null,
      dlcId: gameType === "DLC" ? dlcId : null,
      userId,
    });

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "CASUAL_ADD_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
