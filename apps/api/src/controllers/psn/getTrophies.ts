import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";

export const getTrophies = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    req.log.error({ err }, "GET_PSN_TROPHIES_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
