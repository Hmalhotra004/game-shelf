import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { list, listItem } from "@/db/schema";
import type { Request, Response } from "express";

import type {
  createListItemSchemaType,
  createListSchemaType,
} from "@repo/schemas/server/schemas/list";

export const addList = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { name } = req.cleanBody as createListSchemaType;

    const existing = await db.query.list.findFirst({
      where: (l, { and, eq }) => and(eq(l.userId, userId), eq(l.name, name)),
    });

    if (existing)
      return res
        .status(409)
        .json({ error: "A list with this name already exists" });

    const [createdList] = await db
      .insert(list)
      .values({ name, userId: userId })
      .returning();

    return res.status(201).json(createdList);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};

export const addListItem = async (req: Request, res: Response) => {
  try {
    const listId = req.list!.id;
    const { collectionId } = req.cleanBody as createListItemSchemaType;

    const existing = await db.query.listItem.findFirst({
      where: (item, { and, eq }) =>
        and(eq(item.listId, listId), eq(item.collectionId, collectionId)),
    });

    if (existing) return res.sendStatus(204);

    const [item] = await db
      .insert(listItem)
      .values({ listId, collectionId })
      .returning();

    return res.status(200).json(item);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
