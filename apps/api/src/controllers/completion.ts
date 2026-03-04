import type { Request, Response } from "express";

import { GenericErrorMessage } from "@/constants";

export const getMany = async (req: Request, res: Response) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
