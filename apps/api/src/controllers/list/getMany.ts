import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
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
  } catch (err) {
    req.log.error({ err }, "LIST_GET_MANY_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
