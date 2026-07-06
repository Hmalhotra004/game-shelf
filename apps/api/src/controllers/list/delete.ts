import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { list, listItem } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const deleteList = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const listId = req.list!.id;

    const [deleted] = await db
      .delete(list)
      .where(and(eq(list.id, listId), eq(list.userId, userId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: "List not found" });

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "DELETE_LIST_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};

export const deleteListItem = async (req: Request, res: Response) => {
  try {
    const listId = req.list!.id;
    const listItemId = req.listItem!.id;

    await db
      .delete(listItem)
      .where(and(eq(listItem.id, listItemId), eq(listItem.listId, listId)));

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "DELETE_LIST_ITEM_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
