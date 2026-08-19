export const IGDBPlatformId = {
  167: "PS5",
  48: "PS4",
  9: "PS3",

  169: "Series X|S",
  49: "XONE",

  6: "PC",

  508: "Switch 2",
};

export const GameType = {
  0: "Main Game",
  1: "DLC",
  2: "Expansion",
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

  // Cover
  Cover = "cover",
  CoverAll = "cover.*",
  CoverUrl = "cover.url",
  CoverImageId = "cover.image_id",

  // Game Type
  GameTypeAll = "game_type.*",
  GameType = "game_type",

  // Platforms
  PlatformsAll = "platforms.*",
  Platforms = "platforms",
  PlatformsInfo = "platforms.name,platforms.abbreviation,platforms.alternative_name",

  // Parent game
  ParentGame = "parent_game",
  ParentGameAll = "parent_game.*",
  ParentGameInfo = "parent_game.name,parent_game.cover.image_id",

  // external_games
  ExternalGamesAll = "external_games.*",
  ExternalGamesInfo = "external_games.external_game_source,external_games.game,external_games.id,external_games.uid,external_games.url",

  // Genres (expanded)
  Genres = "genres",
  GenresName = "genres.name",
  GenresAll = "genres.*",

  // DLCs + Expansions (auto-expand)
  DlcsAll = "dlcs.*",
  DlcsInfo = `dlcs.name,
  dlcs.cover.image_id,
  dlcs.first_release_date,
  dlcs.game_type.type,
  dlcs.external_games.external_game_source,
  dlcs.external_games.game,
  dlcs.external_games.id,
  dlcs.external_games.uid,
  dlcs.external_games.url,
  dlcs.artworks.id,
  dlcs.artworks.game,
  dlcs.artworks.height,
  dlcs.artworks.width,
  dlcs.artworks.image_id,
  dlcs.artworks.artwork_type`,

  ExpansionsAll = "expansions.*",
  ExpansionsInfo = `expansions.name,
  expansions.cover.image_id,
  expansions.first_release_date,
  expansions.game_type.type,
  expansions.external_games.external_game_source,
  expansions.external_games.game,
  expansions.external_games.id,
  expansions.external_games.uid,
  expansions.external_games.url,
  expansions.artworks.id,
  expansions.artworks.game,
  expansions.artworks.height,
  expansions.artworks.width,
  expansions.artworks.image_id,
  expansions.artworks.artwork_type`,

  // Artworks
  ArtworksAll = "artworks.*",
  ArtworksInfo = "artworks.id,artworks.game,artworks.height,artworks.width,artworks.image_id,artworks.artwork_type",
  ArtworksUrl = "artworks.url",
  ArtworksImageId = "artworks.image_id",

  ExpandedGamesAll = "expanded_games.*",
  StandaloneExpansions = "standalone_expansions.*",

  Summary = "summary",
  Storyline = "storyline",
  Status = "game_status",
  Slug = "slug",

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
  ScreenshotsAll = "screenshots.*",
  ScreenshotsUrl = "screenshots.url",
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

  // Multiplayer data
  MultiplayerModes = "multiplayer_modes.*",

  // Player perspective + game modes (expanded)
  PlayerPerspectives = "player_perspectives.*",
  GameModes = "game_modes.*",

  // Themes (expanded)
  Themes = "themes.*",

  // Release dates (expanded)
  ReleaseDates = "release_dates.*",

  // Collections
  Collection = "collection.*",

  // Companies (expanded)
  InvolvedCompanies = "involved_companies.*",
}
