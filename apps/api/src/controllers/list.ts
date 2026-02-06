import { db } from "@/db";
import { list } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import type {
  createListSchemaType,
  updateListSchemaType,
} from "@repo/schemas/server/schemas/list";

import type { Request, Response } from "express";

export const getMany = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const lists = await db.query.list.findMany({
      where: (l, { eq }) => eq(l.userId, userId),
      orderBy: (c, { asc }) => asc(c.name),
      columns: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json(lists);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getListItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const selectedList = req.list!;

    const listItems = await db.query.list.findMany({
      where: (list, { eq, and }) =>
        and(eq(list.id, selectedList.id), eq(list.userId, userId)),
      columns: { id: true, name: true },
      with: {
        items: {
          columns: { id: true },
          with: {
            collection: {
              columns: { id: true, name: true, image: true, customImage: true },
            },
          },
        },
      },
    });

    if (listItems.length === 0)
      return res.status(404).json({ error: "No Items found" });

    return res.status(200).json(listItems);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// TODO
export const addListItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const listToUpdate = req.list!;

    console.log("here");

    const { name } = req.cleanBody as updateListSchemaType;

    if (name === listToUpdate.name) return res.sendStatus(204);

    const existing = await db.query.list.findFirst({
      where: (l, { and, eq, ne }) =>
        and(eq(l.userId, userId), eq(l.name, name), ne(l.id, listToUpdate.id)),
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: `List with name "${name}" already exists` });
    }

    const [updated] = await db
      .update(list)
      .set({ name })
      .where(and(eq(list.id, listToUpdate.id), eq(list.userId, userId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "List not found" });
    }

    return res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const listToDelete = req.list!;

    const [deleted] = await db
      .delete(list)
      .where(and(eq(list.id, listToDelete.id), eq(list.userId, userId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: "List not found" });

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// TODO
export const deleteListItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
