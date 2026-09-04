import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import type { Request, Response } from "express";

export const getListItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const listId = req.list!.id;

    const listItems = await db.query.list.findMany({
      where: (list, { eq, and }) =>
        and(eq(list.id, listId), eq(list.userId, userId)),
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
  } catch (err) {
    req.log.error({ err }, "GET_LIST_ITEMS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
