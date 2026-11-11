import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, completion, dlc, playthrough } from "@/db/schema";
import { toISO } from "@/lib/utils";
import type { PickNextQuerySchemaType } from "@repo/schemas/schemas/stats";
import { and, eq, exists, notExists, sql } from "drizzle-orm";
import type { Request, Response } from "express";

export const getPickNext = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { exclude } = req.cleanQuery as PickNextQuerySchemaType;

    const gameAddedAt = sql<Date>`coalesce(${collection.dateOfPurchase}, ${collection.createdAt})`;
    const dlcAddedAt = sql<Date>`coalesce(${dlc.dateOfPurchase}, ${dlc.createdAt})`;

    const [games, dlcs] = await Promise.all([
      db
        .select({
          id: collection.id,
          name: collection.name,
          image: collection.image,
          customImage: collection.customImage,
          platform: collection.platform,
          addedAt: gameAddedAt,
        })
        .from(collection)
        .where(
          and(
            eq(collection.userId, userId),
            eq(collection.status, "Backlog"),
            eq(collection.archived, false),
            notExists(
              db
                .select({ one: sql`1` })
                .from(playthrough)
                .where(
                  and(
                    eq(playthrough.collectionId, collection.id),
                    eq(playthrough.status, "Active"),
                  ),
                ),
            ),
          ),
        ),

      db
        .select({
          id: dlc.id,
          name: dlc.name,
          image: dlc.image,
          customImage: dlc.customImage,
          collectionId: dlc.collectionId,
          parentName: collection.name,
          platform: collection.platform,
          addedAt: dlcAddedAt,
        })
        .from(dlc)
        .innerJoin(collection, eq(dlc.collectionId, collection.id))
        .where(
          and(
            eq(dlc.userId, userId),
            eq(dlc.status, "Backlog"),
            eq(dlc.archived, false),
            eq(collection.archived, false),
            exists(
              db
                .select({ one: sql`1` })
                .from(completion)
                .where(eq(completion.collectionId, dlc.collectionId)),
            ),
            notExists(
              db
                .select({ one: sql`1` })
                .from(playthrough)
                .where(
                  and(
                    eq(playthrough.dlcId, dlc.id),
                    eq(playthrough.status, "Active"),
                  ),
                ),
            ),
          ),
        ),
    ]);

    const pool = [
      ...games.map((g) => ({
        id: g.id,
        gameType: "Game",
        name: g.name,
        parentName: null,
        image: g.customImage ?? g.image,
        collectionId: g.id,
        platform: g.platform,
        addedAt: toISO(g.addedAt),
      })),
      ...dlcs.map((d) => ({
        id: d.id,
        gameType: "DLC",
        name: d.name,
        parentName: d.parentName,
        image: d.customImage ?? d.image,
        collectionId: d.collectionId,
        platform: d.platform,
        addedAt: toISO(d.addedAt),
      })),
    ];

    if (pool.length === 0) {
      return res.status(200).json({ oldest: null, random: null });
    }

    const oldest = pool.reduce((a, b) =>
      new Date(b.addedAt).getTime() < new Date(a.addedAt).getTime() ? b : a,
    );

    // Avoid repeating the pick the client is already showing, unless it is
    // the only candidate.
    const candidates = exclude ? pool.filter((p) => p.id !== exclude) : pool;
    const choices = candidates.length > 0 ? candidates : pool;
    const random = choices[Math.floor(Math.random() * choices.length)];

    return res.status(200).json({ oldest, random });
  } catch (err) {
    req.log.error({ err }, "GET_PICK_NEXT_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
