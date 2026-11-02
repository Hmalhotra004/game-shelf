import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection, list, listItem } from "@/db/schema";
import { queueResolveNPCId } from "@/jobs/resolveNPCId";
import { TROPHY_VERSIONS } from "@/lib/utils";
import { UpdateCollectionSchemaType } from "@repo/schemas/schemas/collection";
import { and, eq, inArray } from "drizzle-orm";
import type { Request, Response } from "express";

export const update = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const PSNAccountId = req.user!.PSNAccountId;
    const game = req.collection!;

    const {
      PSVersion,
      amount,
      dateOfPurchase,
      edition,
      lists,
      name,
      ownershipType,
      platform,
      provider,
      status,
    } = req.cleanBody as UpdateCollectionSchemaType;

    // Make sure every submitted list belongs to this user
    const listIds = [...new Set(lists ?? [])];

    if (listIds.length) {
      const ownedLists = await db
        .select({ id: list.id })
        .from(list)
        .where(and(inArray(list.id, listIds), eq(list.userId, userId)));

      if (ownedLists.length !== listIds.length) {
        return res
          .status(400)
          .json({ message: "One or more lists are invalid" });
      }
    }

    const previousVersions = game.platform === "PS" ? game.PSVersion : [];
    const nextVersions = platform === "PS" ? (PSVersion ?? []) : [];
    const needsResolve = nextVersions.some(
      (v) =>
        !previousVersions.includes(v) &&
        TROPHY_VERSIONS.includes(v) &&
        !game.npCommunicationIds?.[v as "PS3" | "PS4" | "PS5"],
    );

    await db.transaction(async (tx) => {
      await tx
        .update(collection)
        .set({
          name,
          edition,
          amount,
          dateOfPurchase: dateOfPurchase ? new Date(dateOfPurchase) : null,
          platform,
          provider,
          status,
          PSVersion: platform === "PS" ? PSVersion : [],
          ownershipType,
        })
        .where(and(eq(collection.id, game.id), eq(collection.userId, userId)));

      // Replace list membership
      await tx.delete(listItem).where(eq(listItem.collectionId, game.id));

      if (listIds.length) {
        await tx.insert(listItem).values(
          listIds.map((listId) => ({
            collectionId: game.id,
            listId,
          })),
        );
      }
    });

    // Resolve NP communication IDs only when a PS version was added.
    // Removed versions are intentionally left alone.
    if (needsResolve && PSNAccountId) {
      try {
        await queueResolveNPCId({
          collectionId: game.id,
          PSNAccountId,
          collectionName: name ?? game.name,
          userId,
        });
      } catch (err) {
        req.log.error(
          { err, collectionId: game.id },
          "QUEUE_RESOLVE_NPC_ID_ERROR",
        );
      }
    }

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "UPDATE_COLLECTION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
