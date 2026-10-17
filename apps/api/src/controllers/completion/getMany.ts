import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc, list, listItem } from "@/db/schema";
import { CompletionListQuerySchemaType } from "@repo/schemas/server/schemas/completion";
import { alias } from "drizzle-orm/pg-core";
import type { Request, Response } from "express";

import {
  and,
  eq,
  exists,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

export const getMany = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = req.cleanBody as CompletionListQuerySchemaType;

    const { page, limit, search, platform, style, lists: listFilter } = query;
    const offset = (page - 1) * limit;

    // A completion points at either a game (collectionId) or a DLC (dlcId).
    // For DLC rows the parent game is reached through dlc.collectionId, so
    // platform / list / name filters work the same for both types.
    const parent = alias(collection, "parent_collection");
    const parentId = sql<
      string | null
    >`COALESCE(${completion.collectionId}, ${dlc.collectionId})`;

    // ---------- filters ----------
    const conditions: (SQL | undefined)[] = [eq(completion.userId, userId)];

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(or(ilike(parent.name, term), ilike(dlc.name, term)));
    }

    if (platform?.length) {
      conditions.push(inArray(parent.platform, platform));
    }

    if (style?.length) {
      conditions.push(inArray(completion.completionStyle, style));
    }

    if (listFilter?.length) {
      // parent game belongs to at least one of the selected lists
      conditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(listItem)
            .where(
              and(
                eq(listItem.collectionId, parent.id),
                inArray(listItem.listId, listFilter),
              ),
            ),
        ),
      );
    }

    const where = and(...conditions);

    // ---------- page of completions + overall aggregates (parallel) ----------
    const [rows, [countRow], [playtimeRow]] = await Promise.all([
      db
        .select({
          id: completion.id,
          gameType: completion.gameType,
          totalPlaytime: completion.totalPlaytime,
          completedAt: completion.completedAt,
          notes: completion.notes,
          completionStyle: completion.completionStyle,
          collectionId: completion.collectionId,
          dlcId: completion.dlcId,
          // display info (parent game, and the DLC itself when applicable)
          parentCollectionId: parent.id,
          name: parent.name,
          image: parent.image,
          customImage: parent.customImage,
          platform: parent.platform,
          provider: parent.provider,
          dlcName: dlc.name,
        })
        .from(completion)
        .leftJoin(dlc, eq(dlc.id, completion.dlcId))
        .leftJoin(parent, eq(parent.id, parentId))
        .where(where)
        // most recent first; id as tiebreaker => stable pages for infinite scroll
        .orderBy(
          sql`${completion.completedAt} DESC NULLS LAST`,
          sql`${completion.id} ASC`,
        )
        .limit(limit)
        .offset(offset),

      // total completions matching filters
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(completion)
        .leftJoin(dlc, eq(dlc.id, completion.dlcId))
        .leftJoin(parent, eq(parent.id, parentId))
        .where(where),

      // sum of playtime matching filters
      db
        .select({
          total: sql<string>`COALESCE(SUM(${completion.totalPlaytime}), 0)`,
        })
        .from(completion)
        .leftJoin(dlc, eq(dlc.id, completion.dlcId))
        .leftJoin(parent, eq(parent.id, parentId))
        .where(where),
    ]);

    const total = countRow?.count ?? 0;
    const totalPlaytime = Number(playtimeRow?.total ?? 0);
    const hasNextPage = offset + rows.length < total;

    if (rows.length === 0) {
      return res.status(200).json({
        items: [],
        total,
        totalPlaytime,
        page,
        limit,
        hasNextPage: false,
        nextPage: null,
      });
    }

    // ---------- per-page details (only for the games on this page) ----------
    const gameIds = [
      ...new Set(
        rows
          .map((r) => r.parentCollectionId)
          .filter((id): id is string => !!id),
      ),
    ];

    const listRows = gameIds.length
      ? await db
          .select({
            collectionId: listItem.collectionId,
            ids: sql<string[]>`array_agg(${list.id})`,
          })
          .from(listItem)
          .innerJoin(list, eq(list.id, listItem.listId))
          .where(
            and(
              eq(list.userId, userId),
              inArray(listItem.collectionId, gameIds),
            ),
          )
          .groupBy(listItem.collectionId)
      : [];

    const listsByGameId = Object.fromEntries(
      listRows.map((l) => [l.collectionId, l.ids ?? []]),
    );

    // ---------- assemble ----------
    const items = rows.map(({ parentCollectionId, ...r }) => ({
      ...r,
      listIds: (parentCollectionId && listsByGameId[parentCollectionId]) || [],
    }));

    return res.status(200).json({
      items,
      total, // total completions matching the filters (all pages)
      totalPlaytime, // total playtime (seconds) matching the filters
      page,
      limit,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null, // handy for getNextPageParam
    });
  } catch (err) {
    req.log.error({ err }, "COMPLETION_GET_MANY_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
