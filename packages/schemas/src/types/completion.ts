import { CompletionListQuerySchemaType } from "@repo/schemas/schemas/completion";

import {
  CompletionStyleType,
  GameType,
  PlatformType,
  ProviderType,
  PSVersionType,
} from "./index";

export type CompletionGetMany = {
  id: string;
  listIds: string[];
  gameType: GameType;
  totalPlaytime: number | null;
  completedAt: Date | null;
  notes: string | null;
  completionStyle: CompletionStyleType;
  collectionId: string | null;
  dlcId: string | null;
  name: string | null;
  image: string | null;
  customImage: string | null;
  platform: PlatformType;
  provider: ProviderType | null;
  PSVersion: PSVersionType;
  gamePSVersions: PSVersionType[];
  dlcName: string | null;
};

export type CompletionGetManyResponse = {
  items: CompletionGetMany[];
  total: number;
  totalPlaytime: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
};

export type CompletionGetManyFilters = Omit<
  CompletionListQuerySchemaType,
  "page" | "limit"
> & { limit?: number };
