import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc, listItem } from "@/db/schema";
import { queueResolveNPCId } from "@/jobs/resolveNPCId";
import { queueResolveSteamAppId } from "@/jobs/Resolvesteamappid.job";
import { CreateCollectionBundleSchemaType } from "@repo/schemas/schemas/collection";
import type { Request, Response } from "express";

const getPgErrorCode = (err: unknown): string | undefined => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code ?? e?.cause?.code;
};

export const addBundle = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const PSNAccountId = req.user.PSNAccountId;

  try {
    const data = req.cleanBody as CreateCollectionBundleSchemaType;

    if (!data.collections.length) {
      return res
        .status(400)
        .json({ message: "A bundle needs at least one game" });
    }

    const dateOfPurchase = data.dateOfPurchase
      ? new Date(data.dateOfPurchase)
      : null;

    const createdGames = await db.transaction(async (tx) => {
      const created = await tx
        .insert(collection)
        .values(
          data.collections.map((c) => ({
            igdbId: String(c.igdbId),
            name: c.name,
            amount: c.amount,
            image: c.image,
            coverImage: c.coverImage,
            steamAppId: c.steamAppId ?? null,
            platform: data.platform,
            provider: data.provider,
            PSVersion: data.platform === "PS" ? data.PSVersion : [],
            ownershipType: data.ownershipType,
            dateOfPurchase,
            dlcCount: c.DLCs?.length ?? 0,
            userId,
            completions: 0,
          })),
        )
        .returning();

      // RETURNING keeps the insert order, so created[i] matches collections[i]
      const dlcRows = data.collections.flatMap((c, i) =>
        (c.DLCs ?? []).map((d) => ({
          igdbId: String(d.igdbId),
          name: d.name,
          image: d.image,
          coverImage: d.coverImage,
          steamAppId: d.steamAppId ?? null,
          // DLCs in a bundle are always free and Included
          ownershipType: "Included" as const,
          amount: null,
          dateOfPurchase,
          collectionId: created[i].id,
          userId,
        })),
      );

      if (dlcRows.length) {
        await tx.insert(dlc).values(dlcRows);
      }

      if (data.lists?.length) {
        await tx.insert(listItem).values(
          created.flatMap((game) =>
            data.lists!.map((listId) => ({
              collectionId: game.id,
              listId,
            })),
          ),
        );
      }

      return created;
    });

    // The job re-resolves the game and all of its DLCs
    for (const game of createdGames) {
      try {
        await queueResolveSteamAppId({ collectionId: game.id, userId });
      } catch (err) {
        req.log.error(
          { err, collectionId: game.id },
          "QUEUE_RESOLVE_STEAM_APP_ID_ERROR",
        );
      }
    }

    if (data.platform === "PS" && PSNAccountId) {
      for (const game of createdGames) {
        try {
          await queueResolveNPCId({
            collectionId: game.id,
            PSNAccountId,
            collectionName: game.name,
            userId,
          });
        } catch (err) {
          req.log.error(
            { err, collectionId: game.id },
            "QUEUE_RESOLVE_NPC_ID_ERROR",
          );
        }
      }
    }

    return res.sendStatus(204);
  } catch (err) {
    // user_steam_game_unique: one of the games is already in the collection
    if (getPgErrorCode(err) === "23505") {
      return res.status(409).json({
        message:
          "One or more games in this bundle are already in your collection",
      });
    }

    req.log.error({ err }, "ADD_BUNDLE_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
