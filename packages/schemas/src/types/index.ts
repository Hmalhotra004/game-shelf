import z from "zod";
import { playthroughStatusSchema } from "../schemas/playthrough";

import {
  platformSchema,
  providerSchema,
  PSVersionSchema,
  statusSchema,
} from "../schemas/collection";

import {
  GameTypeSchema,
  ownershipTypeSchema,
  SyncTypeSchema,
} from "../schemas";

import {
  completionStatusSchema,
  completionStyleSchema,
} from "../schemas/completion";

export type PlatformType = z.infer<typeof platformSchema>;
export type ProviderType = z.infer<typeof providerSchema>;
export type CollectionStatusType = z.infer<typeof statusSchema>;
export type OwnershipType = z.infer<typeof ownershipTypeSchema>;
export type PSVersionType = z.infer<typeof PSVersionSchema>;
export type PlaythroughStatusType = z.infer<typeof playthroughStatusSchema>;
export type GameType = z.infer<typeof GameTypeSchema>;
export type CompletionStyleType = z.infer<typeof completionStyleSchema>;
export type CompletionStatusType = z.infer<typeof completionStatusSchema>;
export type SyncType = z.infer<typeof SyncTypeSchema>;
// export type UserAccountType = z.infer<typeof UserAccountTySchema>;
export type PlatformAccountType = "steam" | "playstation" | "epic" | "xbox";
export type PSVersionTrophyType = Exclude<PSVersionType, "PS1" | "PS2">;

export type DataType = { label: string; value: number };

export type Theme = "dark" | "light";
export type CollectionCardVariant = "compact" | "overlay" | "slideUp";

export type ReleaseInfo = {
  version: string; // "0.1.2" (leading "v" stripped)
  notes: string;
  apkUrl: string;
  pageUrl: string; // fallback: open the release page in the browser
};
