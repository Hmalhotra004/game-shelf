export type IGDBSearchType = {
  id: number;
  name: string;
  game_type: number;
  platforms: number[];
  cover: Omit<CoverType, "url">;
  first_release_date: number | null;
};

export type SearchGameClientResponse = {
  id: number;
  name: string;
  coverUrl: string;
  releaseYear: string | null;
  isDLC: boolean;
  isBundle: boolean;
}[];

export type IGDBGetByIdType = {
  id: number;
  name: string;
  platforms: PlatformType[];
  cover: Omit<CoverType, "url">;
  game_type: number;
  summary: string;
  genres: Genres[];
  first_release_date: number | null;

  dlcs: IGDBDlcs[] | undefined;
  expansions: IGDBDlcs[] | undefined;
  external_games: ExternalGames[];
  artworks: Artworks[];
};

export type GetByIdClientResponse = {
  id: number;
  name: string;
  game_type: number;
  platforms: PlatformType[];
  image: string;
  coverImage: string;
  steamAppId: string | null;
  summary: string;
  releaseDate: string;
  genres: Genres[];
  dlcs: DLCs[];
};

export type DLCs = {
  id: number;
  name: string;
  image: string;
  coverImage: string | null;
  releaseDate: Date | null;
  steamAppId: number | null;
};

export type IGDBDlcs = {
  id: number;
  name: string;
  cover: Omit<CoverType, "url">;
  first_release_date: number | null;
  external_games: ExternalGames[];
  artworks: Artworks[];
};

export type CoverType = {
  id: number;
  url: string;
  image_id: string;
};

export type PlatformType = {
  id: number;
  name: string;
  abbreviation: string;
  alternative_name: string;
};

export type Genres = {
  id: number;
  name: "Platform";
};

export type ExternalGames = {
  external_game_source: number;
  game: number;
  id: number;
  uid: number;
  url: string;
};

export type Artworks = {
  id: number;
  game: number;
  height: number;
  image_id: string;
  width: number;
  artwork_type: number;
};
