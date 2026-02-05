import z from "zod";

import {
  platformSchema,
  providerSchema,
  PSVersionSchema,
  statusSchema,
} from "@repo/schemas/schemas/collection";

export type PlatformType = z.infer<typeof platformSchema>;
export type ProviderType = z.infer<typeof providerSchema>;
export type CollectionStatusType = z.infer<typeof statusSchema>;
export type PSVersionType = z.infer<typeof PSVersionSchema>;

export type CollectionGetMany = {
  id: string;
  name: string;
  amount: string;
  dateOfPurchase: Date;
  image: string | null;
  customImage: string | null;
  platform: PlatformType;
  provider: ProviderType;
  status: CollectionStatusType;
  completions: number;
  dlcCount: number;
  listIds: string[];
  steamAppId: string | null;
  totalAmount: number;
  totalPlaytime: number;
  onlinePlaySecs: number;
};
