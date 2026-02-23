import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";

import type { NextFunction, Request, Response } from "express";

export async function verifyPlaythrough(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const playthroughId = req.params.playthroughId as string;

    if (!playthroughId) {
      return res.status(400).json({ error: "playthrough is required" });
    }

    const userId = req.user.id;

    const playthrough = await db.query.playthrough.findFirst({
      where: (p, { and, eq }) =>
        and(eq(p.id, playthroughId), eq(p.userId, userId)),
    });

    if (!playthrough) {
      return res.status(404).json({ error: "Playthrough not found" });
    }

    req.playthrough = playthrough;

    next();
  } catch (err) {
    console.error("verifyPlaythrough middleware error:", err);
    res.status(500).json({ error: GenericErrorMessage });
  }
}

export async function verifyPlaythroughSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.playthrough) {
      return res.status(400).json({ error: "Playthrough missing" });
    }

    const playthroughSessionId = req.params.playthroughSessionId as string;

    if (!playthroughSessionId) {
      return res.status(400).json({ error: "playthroughSession is required" });
    }

    const userId = req.user.id;

    const playthroughSession = await db.query.playthroughSession.findFirst({
      where: (ps, { and, eq }) =>
        and(
          eq(ps.id, playthroughSessionId),
          eq(ps.playthroughId, req.playthrough!.id),
          eq(ps.userId, userId),
        ),
    });

    if (!playthroughSession) {
      return res.status(404).json({ error: "PlaythroughSession not found" });
    }

    req.playthroughSession = playthroughSession;

    next();
  } catch (err) {
    console.error("verifyPlaythroughSession middleware error:", err);
    res.status(500).json({ error: GenericErrorMessage });
  }
}
