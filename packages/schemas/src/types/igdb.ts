export type IGDBSearchType = {
  id: number;
  name: string;
  game_type: number;
  platforms: number[];
  cover: Omit<CoverType, "url">;
  first_release_date: number | null;
};

export type SearchGame = {
  id: number;
  name: string;
  coverUrl: string;
  releaseYear: string | null;
  isDLC: boolean;
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
};

export type GetById = {
  id: number;
  name: string;
  game_type: number;
  platforms: PlatformType[];
  coverUrl: string;
  summary: string;
  releaseDate: string;
  genres: Genres[];
  dlcs: { id: number; name: string; coverUrl: string; releaseDate: string }[];
};

export type IGDBDlcs = {
  id: number;
  name: string;
  cover: Omit<CoverType, "url">;
  first_release_date: number | null;
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
