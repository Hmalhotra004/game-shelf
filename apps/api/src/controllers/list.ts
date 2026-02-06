import { db } from "@/db";
import { list } from "@/db/schema";
import { createListSchema } from "@repo/schemas/server/schemas/list";

import type { Request, Response } from "express";
import z from "zod";

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

    const { name } = req.cleanBody as z.infer<typeof createListSchema>;

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
