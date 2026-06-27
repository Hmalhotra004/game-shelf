import { GenericErrorMessage } from "@/constants";
import type { Request, Response } from "express";

export const getMany = async (req: Request, res: Response) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
