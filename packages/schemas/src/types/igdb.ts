export type IGDBSearchType = {
  id: number;
  name: string;
  game_type: number;
  platforms: number[];
  cover: Omit<CoverType, "url">;
  first_release_date: number | null;
};

export type CoverType = {
  id: number;
  url: string;
  image_id: string;
};

export type SearchGame = {
  id: number;
  name: string;
  coverUrl: string;
  releaseYear: string | null;
}[];
