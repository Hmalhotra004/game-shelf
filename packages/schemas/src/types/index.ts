import type { ComponentType, ReactNode } from "react";
import z from "zod";

import {
  platformSchema,
  providerSchema,
  PSVersionSchema,
  statusSchema,
} from "../schemas/collection";

import { GameTypeSchema, SyncTypeSchema } from "../schemas";
import { completionStyleSchema } from "../schemas/completion";
import { playthroughStatusSchema } from "../schemas/playthrough";

export type PlatformType = z.infer<typeof platformSchema>;
export type ProviderType = z.infer<typeof providerSchema>;
export type CollectionStatusType = z.infer<typeof statusSchema>;
export type PSVersionType = z.infer<typeof PSVersionSchema>;
export type PlaythroughStatusType = z.infer<typeof playthroughStatusSchema>;
export type GameType = z.infer<typeof GameTypeSchema>;
export type CompletionStyleType = z.infer<typeof completionStyleSchema>;
export type SyncType = z.infer<typeof SyncTypeSchema>;
// export type UserAccountType = z.infer<typeof UserAccountSchema>;

export type LinkType = ComponentType<{
  to: string;
  children: ReactNode;
  className?: string;
}>;

export type DataType = { label: string; value: number };
