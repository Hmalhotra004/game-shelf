import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";

export const update = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    req.log.error({ err }, "UPDATE_COLLECTION_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
