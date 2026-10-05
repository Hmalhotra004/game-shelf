import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const [issue] = result.error.issues;
      return res.status(400).json({
        error: issue.message,
        field: issue.path.join("."),
      });
    }

    req.cleanBody = result.data;
    next();
  };
}

export function validateQueryParams(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const [issue] = result.error.issues;
      return res.status(400).json({
        error: issue.message,
        field: issue.path.join("."),
      });
    }

    req.cleanQuery = result.data;
    next();
  };
}
