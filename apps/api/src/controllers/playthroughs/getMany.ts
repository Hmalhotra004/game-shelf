import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { PlaythroughListQuerySchemaType } from "@repo/schemas/server/schemas/playthrough";
import { alias } from "drizzle-orm/pg-core";
import type { Request, Response } from "express";

import {
  collection,
  dlc,
  listItem,
  playthrough,
  playthroughSession,
} from "@/db/schema";

import {
  and,
  asc,
  desc,
  eq,
  exists,
  getTableColumns,
  ilike,
  inArray,
  ne,
  sql,
  type SQL,
} from "drizzle-orm";

const statusOrder = sql`CASE ${playthrough.status}
  WHEN 'Active' THEN 0
  WHEN 'On Hold' THEN 1
  WHEN 'Completed' THEN 2
  WHEN 'Archived' THEN 4
  ELSE 3
END`;

export const getMany = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = req.cleanBody as PlaythroughListQuerySchemaType;

    const { page, limit, search, platform, status, lists: listFilter } = query;
    const offset = (page - 1) * limit;

    // A playthrough is either for a game or for a DLC. DLCs get their
    // platform/provider from the parent game, so join it once here.
    const parent = alias(collection, "parent_collection");

    const effectiveName = sql<string>`COALESCE(${collection.name}, ${dlc.name})`;
    const effectivePlatform = sql<
      typeof collection.$inferSelect.platform | null
    >`COALESCE(${collection.platform}, ${parent.platform})`;
    const effectiveProvider = sql<
      typeof collection.$inferSelect.provider | null
    >`COALESCE(${collection.provider}, ${parent.provider})`;
    // the game that "owns" this playthrough (parent game for DLCs)
    const effectiveGameId = sql<string>`COALESCE(${playthrough.collectionId}, ${dlc.collectionId})`;

    // ---------- filters ----------
    const conditions: (SQL | undefined)[] = [eq(playthrough.userId, userId)];

    if (search?.trim()) {
      conditions.push(ilike(effectiveName, `%${search.trim()}%`));
    }

    if (platform?.length) {
      conditions.push(inArray(effectivePlatform, platform));
    }

    if (status?.length) {
      // only the selected statuses (archived included only if selected)
      conditions.push(inArray(playthrough.status, status));
    } else {
      // no status filter => hide archived
      conditions.push(ne(playthrough.status, "Archived"));
    }

    if (listFilter?.length) {
      conditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(listItem)
            .where(
              and(
                eq(listItem.collectionId, effectiveGameId),
                inArray(listItem.listId, listFilter),
              ),
            ),
        ),
      );
    }

    const where = and(...conditions);

    // ---------- page + overall aggregates (parallel) ----------
    const [rows, [aggRow]] = await Promise.all([
      db
        .select({
          ...getTableColumns(playthrough),

          // game
          gameName: collection.name,
          gameImage: collection.image,
          gameCustomImage: collection.customImage,
          gameCoverImage: collection.coverImage,
          gameCustomCoverImage: collection.customCoverImage,

          // dlc
          dlcName: dlc.name,
          dlcImage: dlc.image,

          // resolved through the parent game for DLCs
          platform: effectivePlatform,
          provider: effectiveProvider,
        })
        .from(playthrough)
        .leftJoin(collection, eq(collection.id, playthrough.collectionId))
        .leftJoin(dlc, eq(dlc.id, playthrough.dlcId))
        .leftJoin(parent, eq(parent.id, dlc.collectionId))
        .where(where)
        // id as tiebreaker => stable pages for infinite scroll
        .orderBy(asc(statusOrder), asc(effectiveName), asc(playthrough.id))
        .limit(limit)
        .offset(offset),

      db
        .select({
          count: sql<number>`count(*)::int`,
          totalSeconds: sql<string>`COALESCE(SUM(${playthrough.totalSeconds}), 0)`,
        })
        .from(playthrough)
        .leftJoin(collection, eq(collection.id, playthrough.collectionId))
        .leftJoin(dlc, eq(dlc.id, playthrough.dlcId))
        .leftJoin(parent, eq(parent.id, dlc.collectionId))
        .where(where),
    ]);

    const total = aggRow?.count ?? 0;
    const totalSeconds = Number(aggRow?.totalSeconds ?? 0);
    const hasNextPage = offset + rows.length < total;

    if (rows.length === 0) {
      return res.status(200).json({
        items: [],
        total,
        totalSeconds,
        page,
        limit,
        hasNextPage: false,
        nextPage: null,
      });
    }

    // ---------- sessions (only for the playthroughs on this page) ----------
    const ids = rows.map((r) => r.id);

    const sessions = await db
      .select({
        id: playthroughSession.id,
        playthroughId: playthroughSession.playthroughId,
        playDate: playthroughSession.playDate,
        duration: playthroughSession.secondsPlayed,
        userId: playthroughSession.userId,
      })
      .from(playthroughSession)
      .where(
        and(
          eq(playthroughSession.userId, userId),
          inArray(playthroughSession.playthroughId, ids),
        ),
      )
      .orderBy(desc(playthroughSession.playDate));

    const sessionMap = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const arr = sessionMap.get(s.playthroughId);
      if (arr) arr.push(s);
      else sessionMap.set(s.playthroughId, [s]);
    }

    // ---------- assemble ----------
    const items = rows.map((pt) => {
      const isDLC = pt.dlcId !== null;

      return {
        id: pt.id,
        collectionId: pt.collectionId,
        dlcId: pt.dlcId,
        userId: pt.userId,
        status: pt.status,
        notes: pt.notes,
        totalSeconds: pt.totalSeconds,
        startedAt: pt.startedAt,
        finishedAt: pt.finishedAt,
        createdAt: pt.createdAt,
        updatedAt: pt.updatedAt,

        gameType: isDLC ? "DLC" : "Game",

        name: isDLC ? pt.dlcName : pt.gameName,
        image: isDLC ? pt.dlcImage : pt.gameImage,
        customImage: isDLC ? pt.dlcImage : pt.gameCustomImage,
        coverImage: isDLC ? pt.dlcImage : pt.gameCoverImage,
        customCoverImage: isDLC ? pt.dlcImage : pt.gameCustomCoverImage,

        platform: pt.platform,
        provider: pt.provider,

        sessions: sessionMap.get(pt.id) ?? [],
      };
    });

    return res.status(200).json({
      items,
      total, // total playthroughs matching the filters (all pages)
      totalSeconds, // total playtime matching the filters
      page,
      limit,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    });
  } catch (err) {
    req.log.error({ err }, "PLAYTHROUGH_GET_MANY_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
