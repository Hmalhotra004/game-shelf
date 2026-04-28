export const IGDBPlatformId = {
  167: "PS5",
  169: "Series X|S",
  48: "PS4",
  9: "PS3",
  6: "PC",
};

export const GameType = {
  0: "Main Game",
  1: "DLC",
  // 2: "",
  3: "Bundle",
  4: "Standalone Expansion",
  5: "Mod",
  // 6:"",
  // 7:"",
  8: "Remake",
  9: "Remaster",
  // 10:"",
  // 11:"",
  // 12:"",
  // 13:"",
  14: "Update",
};

export enum IGDBCoverSizeType {
  "t_micro" = "t_micro",
  "t_thumb" = "t_thumb",
  "t_cover_small" = "t_cover_small",
  "t_cover_big" = "t_cover_big",
  "t_logo_med" = "t_logo_med",

  "t_screenshot_med" = "t_screenshot_med",
  "t_screenshot_big" = "t_screenshot_big",

  "t_720p" = "t_720p",
  "t_1080p" = "t_1080p",
  "t_original" = "t_original",
}

export enum IGDBGameField {
  // Data
  Id = "id",
  Name = "name",
  GameType = "game_type",
  Cover = "cover",
  Platforms = "platforms",

  PlatformsAll = "platforms.*",
  Summary = "summary",
  Storyline = "storyline",
  Status = "status",
  Slug = "slug",
  GameTypeAll = "game_type.*",

  // Dates
  FirstReleaseDate = "first_release_date",
  UpdatedAt = "updated_at",
  CreatedAt = "created_at",

  // Ratings
  Rating = "rating",
  RatingCount = "rating_count",
  AggregatedRating = "aggregated_rating",
  AggregatedRatingCount = "aggregated_rating_count",
  TotalRating = "total_rating",
  TotalRatingCount = "total_rating_count",
  Hypes = "hypes",
  Follows = "follows",
  Popularity = "popularity",

  // Images (auto-expandable)
  CoverImageId = "cover.image_id",
  CoverUrl = "cover.url",
  CoverAll = "cover.*",
  ArtworksAll = "artworks.*",
  ScreenshotsAll = "screenshots.*",
  ArtworksUrl = "artworks.url",
  ScreenshotsUrl = "screenshots.url",
  ArtworksImageId = "artworks.image_id",
  ScreenshotsImageId = "screenshots.image_id",

  // External references
  Url = "url",
  Websites = "websites.*", // websites auto-expand correctly
  Videos = "videos.video_id", // official videos

  // Keywords (expanded by IGDB)
  Keywords = "keywords.*",

  // Age Ratings (auto-expand)
  AgeRatings = "age_ratings.*",

  // Game engines
  GameEngines = "game_engines.*",

  // Standalone expanded fields
  Ports = "ports.*",
  Remakes = "remakes.*",
  Remasters = "remasters.*",
  Forks = "forks.*",
  Bundles = "bundles.*",

  // DLCs + Expansions (auto-expand)
  Dlcs = "dlcs.*",
  Expansions = "expansions.*",

  // Multiplayer data
  MultiplayerModes = "multiplayer_modes.*",

  // Player perspective + game modes (expanded)
  PlayerPerspectives = "player_perspectives.*",
  GameModes = "game_modes.*",

  // Themes (expanded)
  Themes = "themes.*",

  // Release dates (expanded)
  ReleaseDates = "release_dates.*",

  // Platforms (expanded)

  // Genres (expanded)
  Genres = "genres.*",

  // Collections
  Collection = "collection.*",

  // Companies (expanded)
  InvolvedCompanies = "involved_companies.*",
}
