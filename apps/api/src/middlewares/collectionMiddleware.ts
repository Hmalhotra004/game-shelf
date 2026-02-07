import { db } from "@/db";

import type { NextFunction, Request, Response } from "express";

export async function verifyCollection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const collectionId = req.params.collectionId as string;

    if (!collectionId) {
      return res.status(400).json({ error: "game is required" });
    }

    const userId = req.user.id;

    const game = await db.query.collection.findFirst({
      where: (c, { and, eq }) =>
        and(eq(c.id, collectionId), eq(c.userId, userId)),
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    req.collection = game;

    next();
  } catch (err) {
    console.error("VerifyCollection middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
