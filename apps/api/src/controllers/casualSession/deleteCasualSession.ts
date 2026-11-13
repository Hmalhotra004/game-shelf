import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { casualSession } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const deleteCasualSession = async (req: Request, res: Response) => {
  try {
    const casualSessionId = req.casualSession.id!;
    const userId = req.user!.id;

    const deleted = await db
      .delete(casualSession)
      .where(
        and(
          eq(casualSession.id, casualSessionId),
          eq(casualSession.userId, userId),
        ),
      )
      .returning({ id: casualSession.id });

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "CASUAL_DELETE_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
