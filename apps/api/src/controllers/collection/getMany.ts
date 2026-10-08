import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { CollectionListQuerySchemaType } from "@repo/schemas/server/schemas/collection";
import type { Request, Response } from "express";

import {
  and,
  asc,
  eq,
  exists,
  ilike,
  inArray,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  collection,
  completion,
  dlc,
  list,
  listItem,
  playthrough,
} from "@/db/schema";

import {
  getOnlineSteamPlaySecs,
  getSteamPlaytimeByAppId,
  needsSteamPlaytime,
} from "@/lib/onlinePlaytime";

export const getMany = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = req.cleanBody as CollectionListQuerySchemaType;

    const { page, limit, search, platform, status, lists: listFilter } = query;
    const offset = (page - 1) * limit;

    // ---------- filters ----------
    const conditions: (SQL | undefined)[] = [
      eq(collection.userId, userId),
      eq(collection.archived, false),
    ];

    if (search?.trim()) {
      conditions.push(ilike(collection.name, `%${search.trim()}%`));
    }

    if (platform?.length) {
      conditions.push(inArray(collection.platform, platform));
    }

    if (status?.length) {
      conditions.push(inArray(collection.status, status));
    }

    if (listFilter?.length) {
      // game belongs to at least one of the selected lists
      conditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(listItem)
            .where(
              and(
                eq(listItem.collectionId, collection.id),
                inArray(listItem.listId, listFilter),
              ),
            ),
        ),
      );
    }

    const where = and(...conditions);

    // ---------- page of games + overall aggregates (parallel) ----------
    const [games, [countRow], [collectionAmountRow], [dlcAmountRow]] =
      await Promise.all([
        db
          .select({
            id: collection.id,
            name: collection.name,
            amount: collection.amount,
            image: collection.image,
            customImage: collection.customImage,
            platform: collection.platform,
            provider: collection.provider,
            status: collection.status,
            dlcCount: collection.dlcCount,
            dateOfPurchase: collection.dateOfPurchase,
            completions: collection.completions,
            steamAppId: collection.steamAppId,
          })
          .from(collection)
          .where(where)
          // id as tiebreaker => stable pages for infinite scroll
          .orderBy(asc(collection.name), asc(collection.id))
          .limit(limit)
          .offset(offset),

        // total games matching filters
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(collection)
          .where(where),

        // sum of game amounts matching filters
        db
          .select({
            total: sql<string>`COALESCE(SUM(${collection.amount}), 0)`,
          })
          .from(collection)
          .where(where),

        // sum of dlc amounts for games matching filters
        db
          .select({ total: sql<string>`COALESCE(SUM(${dlc.amount}), 0)` })
          .from(dlc)
          .innerJoin(collection, eq(collection.id, dlc.collectionId))
          .where(where),
      ]);

    const total = countRow?.count ?? 0;
    const totalAmount =
      Number(collectionAmountRow?.total ?? 0) +
      Number(dlcAmountRow?.total ?? 0);

    const hasNextPage = offset + games.length < total;

    if (games.length === 0) {
      return res.status(200).json({
        items: [],
        total,
        totalAmount,
        page,
        limit,
        hasNextPage: false,
        nextPage: null,
      });
    }

    const ids = games.map((g) => g.id);

    // ---------- per-page details (only for the games on this page) ----------
    // Aggregated separately to avoid the join fan-out that inflated sums
    // when playthrough x completion x dlc were joined together.
    const [lists, playthroughTotals, completionTotals, dlcTotals] =
      await Promise.all([
        db
          .select({
            collectionId: listItem.collectionId,
            name: sql<string[]>`array_agg(${list.name})`,
          })
          .from(listItem)
          .innerJoin(list, eq(list.id, listItem.listId))
          .where(
            and(eq(list.userId, userId), inArray(listItem.collectionId, ids)),
          )
          .groupBy(listItem.collectionId),

        db
          .select({
            collectionId: playthrough.collectionId,
            total: sql<string>`COALESCE(SUM(${playthrough.totalSeconds}), 0)`,
          })
          .from(playthrough)
          .where(inArray(playthrough.collectionId, ids))
          .groupBy(playthrough.collectionId),

        db
          .select({
            collectionId: completion.collectionId,
            total: sql<string>`COALESCE(SUM(${completion.totalPlaytime}), 0)`,
          })
          .from(completion)
          .where(inArray(completion.collectionId, ids))
          .groupBy(completion.collectionId),

        db
          .select({
            collectionId: dlc.collectionId,
            total: sql<string>`COALESCE(SUM(${dlc.amount}), 0)`,
          })
          .from(dlc)
          .where(inArray(dlc.collectionId, ids))
          .groupBy(dlc.collectionId),
      ]);

    const listsByGameId = Object.fromEntries(
      lists.map((l) => [l.collectionId, l.name ?? []]),
    );
    const playthroughByGameId = Object.fromEntries(
      playthroughTotals.map((r) => [r.collectionId, Number(r.total)]),
    );
    const completionByGameId = Object.fromEntries(
      completionTotals.map((r) => [r.collectionId, Number(r.total)]),
    );
    const dlcByGameId = Object.fromEntries(
      dlcTotals.map((r) => [r.collectionId, Number(r.total)]),
    );

    // ---------- steam playtime (only if this page needs it) ----------
    const steamPlaytimeByAppId = games.some(needsSteamPlaytime)
      ? await getSteamPlaytimeByAppId(req.user?.steamId, req.log)
      : {};

    // ---------- assemble ----------
    const items = games.map((g) => ({
      ...g,
      listIds: listsByGameId[g.id] ?? [],
      totalAmount: Number(g.amount ?? 0) + (dlcByGameId[g.id] ?? 0),
      totalPlaytime:
        (playthroughByGameId[g.id] ?? 0) + (completionByGameId[g.id] ?? 0),
      onlinePlaySecs: getOnlineSteamPlaySecs(g, steamPlaytimeByAppId),
    }));

    return res.status(200).json({
      items,
      total, // total games matching the filters (all pages)
      totalAmount, // total spent (games + DLCs) matching the filters
      page,
      limit,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null, // handy for getNextPageParam
    });
  } catch (err) {
    req.log.error({ err }, "COLLECTION_GET_MANY_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
