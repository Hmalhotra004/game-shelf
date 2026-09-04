import { PlatformType, ProviderType } from "./index";

export type GetGamesType = {
  games: {
    id: string;
    name: string;
    igdbId: string;
    image: string | null;
    customImage: string | null;
    coverImage: string | null;
    customCoverImage: string | null;
    platform: PlatformType;
    provider: ProviderType;
  }[];
  dlcs: {
    id: string;
    igdbId: string;
    collectionId: string;
    name: string;
    image: string | null;
  }[];
};

export type AccountProfileType = {
  username: string;
  avatar: string | null;
  realName: string | null;
  profileUrl: string | null;
};
