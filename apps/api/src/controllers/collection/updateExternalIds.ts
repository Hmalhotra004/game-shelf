import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection } from "@/db/schema";
import { ExternalIdsSchemaType } from "@repo/schemas/schemas/collection";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const updateExternalIds = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;
    const { npCommunicationId, steamAppId } =
      req.cleanBody as ExternalIdsSchemaType;

    await db
      .update(collection)
      .set({
        npCommunicationId,
        steamAppId,
      })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "UPDATE_EXTERNAL_ID_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
