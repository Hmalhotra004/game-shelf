import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { list } from "@/db/schema";
import type { updateListSchemaType } from "@repo/schemas/server/schemas/list";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const updateList = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const listToUpdate = req.list!;

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

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "UPDATE_LIST_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
