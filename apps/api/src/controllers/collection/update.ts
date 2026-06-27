import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";

export const update = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
