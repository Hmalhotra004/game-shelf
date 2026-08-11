import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, dlc, listItem } from "@/db/schema";
import { CreateCollectionSchemaType } from "@repo/schemas/schemas/collection";
import { and, eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";

export const addCollection = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const data = req.cleanBody as CreateCollectionSchemaType;

    if (data.isDLC) {
      if (!data.collectionId) {
        return res.status(403).json({
          message: "Parent game is required when selected game is DLC",
        });
      }

      await db.transaction(async (tx) => {
        const [existingCollection] = await tx
          .select({
            id: collection.id,
            provider: collection.provider,
          })
          .from(collection)
          .where(
            and(
              eq(collection.id, data.collectionId!),
              eq(collection.userId, userId),
            ),
          );

        if (!existingCollection) {
          return res.status(404).json({ message: "Game not found" });
        }

        await tx.insert(dlc).values({
          name: data.name,
          image: data.image,
          coverImage: data.coverImage,
          dateOfPurchase: new Date(data.dateOfPurchase),
          amount: data.amount,
          ownershipType: data.ownershipType,
          steamAppId: data.steamAppId ?? null,
          collectionId: existingCollection.id,
          userId,
          completions: 0,
        });

        await tx
          .update(collection)
          .set({ dlcCount: sql`${collection.dlcCount} + 1` })
          .where(
            and(
              eq(collection.id, data.collectionId!),
              eq(collection.userId, userId),
            ),
          );
      });
    } else {
      await db.transaction(async (tx) => {
        const [createdGame] = await tx
          .insert(collection)
          .values({
            name: data.name,
            amount: data.amount,
            image: data.image,
            coverImage: data.coverImage,
            platform: data.platform,
            provider: data.provider,
            PSVersion: data.platform === "PS" ? data.PSVersion : null,
            dateOfPurchase: new Date(data.dateOfPurchase),
            ownershipType: data.ownershipType,
            edition: data.edition,
            steamAppId: data.steamAppId ?? null,
            userId,
            completions: 0,
          })
          .returning();

        if (data.lists?.length) {
          await tx.insert(listItem).values(
            data.lists.map((l) => ({
              collectionId: createdGame.id,
              listId: l,
            })),
          );
        }

        if (data.DLCs?.length) {
          await tx.insert(dlc).values(
            data.DLCs.map((value) => ({
              name: value.name,
              image: value.image,
              coverImage: value.coverImage,
              amount: value.amount,
              dateOfPurchase: new Date(value.dateOfPurchase),
              ownershipType: value.ownershipType,
              steamAppId: value.steamAppId ?? null,
              collectionId: createdGame.id,
              userId,
            })),
          );

          await tx
            .update(collection)
            .set({ dlcCount: data.DLCs.length })
            .where(
              and(
                eq(collection.id, createdGame.id),
                eq(collection.userId, userId),
              ),
            );
        }
      });
    }

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "ADD_COLLECTION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
