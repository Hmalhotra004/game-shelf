import { list } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export {};

declare global {
  namespace Express {
    export interface Request {
      cleanBody: any;
      user?: {
        id: string;
        email: string;
        steamId?: string | null | undefined;
      };
      session?: {
        id: string;
        expiresAt: Date;
      };
      list?: InferSelectModel<typeof list>;
    }
  }
}
