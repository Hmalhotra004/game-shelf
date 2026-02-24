import { PlatformType, PlaythroughStatusType, ProviderType } from "./index";

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
  gameType: string;
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
