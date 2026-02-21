import {
  CollectionStatusType,
  OwnershipType,
  PlatformType,
  ProviderType,
  PSVersionType,
} from "./index";

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
  dateOfPurchase: Date;
  amount: string;
  image: string | null;
  customImage: string | null;
  coverImage: string | null;
  customCoverImage: string | null;
  completions: number;
  platform: PlatformType;
  provider: ProviderType;
  PSVersion: PSVersionType;
  status: CollectionStatusType;
  dlcCount: number;
  ownershipType: OwnershipType;
  hidden: boolean;
  edition: string;
  npCommunicationId: string | null;
  steamAppId: string | null;
  steamGridDBId: string | null;
  lists: { id: string; name: string }[];
  dlcs: Dlc[];
  onlinePlaySecs: number;
  totalTime: number;
};

export type Dlc = {
  id: string;
  name: string;
  dateOfPurchase: Date;
  amount: string;
  image: string | null;
  coverImage: string | null;
  completions: number;
  status: CollectionStatusType;
  ownershipType: OwnershipType;
  npCommunicationId: string | null;
  steamAppId: string | null;
  collectionId: string;
  totalTime: number;
};
