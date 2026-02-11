import { CollectionStatusType, PlatformType, ProviderType } from "./index";

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

export type CollectionGetById = {
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
