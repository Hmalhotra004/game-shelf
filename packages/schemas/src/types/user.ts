import { PlatformType, ProviderType } from "./index";

export type GetGamesType = {
  games: {
    id: string;
    name: string;
    image: string | null;
    customImage: string | null;
    platform: PlatformType;
    provider: ProviderType;
  }[];
  dlcs: {
    id: string;
    collectionId: string;
    name: string;
    image: string | null;
  }[];
};
