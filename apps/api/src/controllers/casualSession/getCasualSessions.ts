import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { casualSession } from "@/db/schema";
import { CasualSessionListQuerySchemaType } from "@repo/schemas/schemas/casualSession";
import { and, count, desc, eq, sum } from "drizzle-orm";
import type { Request, Response } from "express";

export const getCasualSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { gameType, limit, page, collectionId, dlcId } =
      req.cleanBody as CasualSessionListQuerySchemaType;

    const where = and(
      eq(casualSession.userId, userId),
      gameType ? eq(casualSession.gameType, gameType) : undefined,
      collectionId ? eq(casualSession.collectionId, collectionId) : undefined,
      dlcId ? eq(casualSession.dlcId, dlcId) : undefined,
    );

    const [items, [aggregate]] = await Promise.all([
      db
        .select({
          id: casualSession.id,
          playDate: casualSession.playDate,
          secondsPlayed: casualSession.secondsPlayed,
          notes: casualSession.notes,
          createdAt: casualSession.createdAt,
          updatedAt: casualSession.updatedAt,
        })
        .from(casualSession)
        .where(where)
        .orderBy(desc(casualSession.playDate), desc(casualSession.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({
          total: count(),
          totalSeconds: sum(casualSession.secondsPlayed),
        })
        .from(casualSession)
        .where(where),
    ]);

    const total = aggregate?.total ?? 0;
    const totalSeconds = Number(aggregate?.totalSeconds ?? 0);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    const response = {
      items,
      total,
      totalPages,
      totalSeconds,
      page,
      limit,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    };

    return res.status(200).json(response);
  } catch (err) {
    req.log.error({ err }, "GET_CASUAL_SESSIONS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
