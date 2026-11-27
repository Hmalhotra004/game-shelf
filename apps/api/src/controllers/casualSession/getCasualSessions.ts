import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { casualSession } from "@/db/schema";
import { CasualSessionListQuerySchemaType } from "@repo/schemas/schemas/casualSession";
import { and, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const getCasualSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { gameType, limit, page, collectionId, dlcId } =
      req.cleanQuery as CasualSessionListQuerySchemaType;

    const sessions = await db
      .select()
      .from(casualSession)
      .where(
        and(
          eq(casualSession.userId, userId),
          gameType ? eq(casualSession.gameType, gameType) : undefined,
          collectionId
            ? eq(casualSession.collectionId, collectionId)
            : undefined,
          dlcId ? eq(casualSession.dlcId, dlcId) : undefined,
        ),
      )
      .orderBy(desc(casualSession.playDate), desc(casualSession.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return res.status(200).json(sessions);
  } catch (err) {
    req.log.error({ err }, "GET_CASUAL_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
