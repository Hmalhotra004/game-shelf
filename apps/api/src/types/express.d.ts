import { InferSelectModel } from "drizzle-orm";

import {
  collection,
  completion,
  list,
  listItem,
  playthrough,
  playthroughSession,
} from "@/db/schema";

export {};

declare global {
  namespace Express {
    export interface Request {
      cleanBody: any;

      user?: {
        id: string;
        email: string;
        steamId?: string | null | undefined;
        PSNAccountUserName?: string | null | undefined;
        PSNAccountId?: string | null | undefined;
        userAccountType: "User" | "Admin";
        isAdult: boolean;
      };
      session?: {
        id: string;
        expiresAt: Date;
      };

      collection?: InferSelectModel<typeof collection>;
      playthrough?: InferSelectModel<typeof playthrough>;
      playthroughSession?: InferSelectModel<typeof playthroughSession>;
      completion?: InferSelectModel<typeof completion>;

      list?: InferSelectModel<typeof list>;
      listItem?: InferSelectModel<typeof listItem>;
    }
  }
}
