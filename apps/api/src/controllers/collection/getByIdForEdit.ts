import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { list, listItem } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const getByIdForEdit = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const game = req.collection!;

    const listRows = await db
      .select({ id: list.id, name: list.name })
      .from(listItem)
      .innerJoin(list, eq(list.id, listItem.listId))
      .where(and(eq(listItem.collectionId, game.id), eq(list.userId, userId)));

    return res.status(200).json({
      id: game.id,
      name: game.name,
      edition: game.edition,
      dateOfPurchase: game.dateOfPurchase,
      amount: game.amount,
      image: game.image,
      customImage: game.customImage,
      platform: game.platform,
      provider: game.provider,
      PSVersion: game.PSVersion,
      status: game.status,
      ownershipType: game.ownershipType,
      lists: listRows,
    });
  } catch (err) {
    req.log.error({ err }, "COLLECTION_GET_BY_ID_FOR_EDIT_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
