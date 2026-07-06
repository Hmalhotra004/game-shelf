import { GenericErrorMessage } from "@/constants";
import { logger } from "@/lib/logger";
import { CreateCollectionSchemaType } from "@repo/schemas/schemas/collection";
import type { Request, Response } from "express";

export const addCollection = async (req: Request, res: Response) => {
  try {
    const data = req.cleanBody as CreateCollectionSchemaType;

    logger.info({ data });

    return res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "ADD_COLLECTION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
