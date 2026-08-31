import z from "zod";

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

import { completionStyleSchema } from "../schemas/completion";
import { playthroughStatusSchema } from "../schemas/playthrough";

export type PlatformType = z.infer<typeof platformSchema>;
export type ProviderType = z.infer<typeof providerSchema>;
export type CollectionStatusType = z.infer<typeof statusSchema>;
export type OwnershipType = z.infer<typeof ownershipTypeSchema>;
export type PSVersionType = z.infer<typeof PSVersionSchema>;
export type PlaythroughStatusType = z.infer<typeof playthroughStatusSchema>;
export type GameType = z.infer<typeof GameTypeSchema>;
export type CompletionStyleType = z.infer<typeof completionStyleSchema>;
export type SyncType = z.infer<typeof SyncTypeSchema>;
// export type UserAccountType = z.infer<typeof UserAccountTySchema>;

export type DataType = { label: string; value: number };

export type Theme = "dark" | "light";
export type CollectionCardVariant = "compact" | "overlay" | "slideUp";
