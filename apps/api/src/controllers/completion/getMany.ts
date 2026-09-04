import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";

export const getMany = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    req.log.error({ err }, "COMPLETION_GET_MANY_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
