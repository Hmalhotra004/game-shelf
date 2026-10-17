import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import type { NextFunction, Request, Response } from "express";

export async function verifyCompletion(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const completionId = req.params.completionId as string;

    if (!completionId) {
      return res.status(400).json({ error: "Completion is required" });
    }

    const userId = req.user.id;

    const completion = await db.query.completion.findFirst({
      where: (c, { and, eq }) =>
        and(eq(c.id, completionId), eq(c.userId, userId)),
    });

    if (!completion) {
      return res.status(404).json({ error: "Completion not found" });
    }

    req.completion = completion;

    next();
  } catch (err) {
    console.error("verifyCompletion middleware error:", err);
    res.status(500).json({ error: GenericErrorMessage });
  }
}
