import { PlaythroughListQuerySchemaType } from "../schemas/playthrough";

import {
  GameType,
  PlatformType,
  PlaythroughStatusType,
  ProviderType,
  PSVersionType,
} from "./index";

export type PlaythroughGetManyType = {
  id: string;
  collectionId: string | null;
  dlcId: string | null;
  userId: string;
  status: PlaythroughStatusType;
  notes: string | null;
  totalSeconds: number;
  startedAt: string | null;
  finishedAt: string | null;
  gameType: GameType;
  name: string;
  image: string | null;
  customImage: string | null;
  coverImage: string | null;
  customCoverImage: string | null;
  platform: PlatformType;
  provider: ProviderType;
  sessions: Session[];
};

export type Session = {
  id: string;
  playthroughId: string;
  playDate: string;
  duration: number;
  userId: string;
};

export type PlaythroughGetManyResponse = {
  items: PlaythroughGetManyType[];
  total: number;
  totalSeconds: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
};

export type PlaythroughGetManyFilters = Omit<
  PlaythroughListQuerySchemaType,
  "page" | "limit"
> & { limit?: number };

export type PlaythroughGetByIdResponseType = {
  name: string;
  dlcName: string | null;
  image: string | null;
  customImage: string | null;
  coverImage: string | null;
  customCoverImage: string | null;
  platform: PlatformType;
  provider: ProviderType;
  PSVersion: PSVersionType[];
  id: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  status: PlaythroughStatusType;
  totalSeconds: number;
  gameType: GameType;
  notes: string | null;
  collectionId: string | null;
  dlcId: string | null;
  userId: string;
  completionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
