import { db } from "@/db";

import type { NextFunction, Request, Response } from "express";

export async function verifyList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const listId = req.params.listId as string;

    if (!listId) {
      return res.status(400).json({ error: "listId is required" });
    }

    const userId = req.user.id;

    const list = await db.query.list.findFirst({
      where: (l, { and, eq }) => and(eq(l.id, listId), eq(l.userId, userId)),
    });

    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    req.list = list;

    next();
  } catch (err) {
    console.error("VerifyList middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
