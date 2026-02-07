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

export async function verifyListItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.list) return res.status(400).json({ error: "List is missing" });

    const listItemId = req.params.listItemId as string;

    if (!listItemId) {
      return res.status(400).json({ error: "listItemId is required" });
    }

    const list = req.list;

    const listItem = await db.query.listItem.findFirst({
      where: (lt, { and, eq }) =>
        and(eq(lt.id, listItemId), eq(lt.listId, list.id)),
    });

    if (!listItem) {
      return res.status(404).json({ error: "ListItem not found" });
    }

    req.listItem = listItem;

    next();
  } catch (err) {
    console.error("VerifyListItem middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
