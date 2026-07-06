import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { collection } from "@/db/schema";
import { UpdateImagesSchemaType } from "@repo/schemas/schemas/collection";
import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export const updateImages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const collectionId = req.collection!.id;
    const { customCoverImage, customImage } =
      req.cleanBody as UpdateImagesSchemaType;

    await db
      .update(collection)
      .set({ customImage, customCoverImage })
      .where(
        and(eq(collection.id, collectionId), eq(collection.userId, userId)),
      );

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "UPDATE_IMAGES_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
