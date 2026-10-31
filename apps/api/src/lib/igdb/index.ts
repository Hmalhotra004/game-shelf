import { STEAM_URL_REGEX } from "@/constants";
import axios from "axios";
import { resolveSteamImage, SteamImageSizeType } from "../steam";
import { IGDBCoverSizeType, IGDBGameField } from "./enum";

import {
  Artworks,
  IGDBGameLike,
  IGDBGetByIdType,
} from "@repo/schemas/types/igdb";

export const igdb = axios.create({
  baseURL: "https://api.igdb.com/v4",
  headers: {
    "Client-ID": process.env.IGDB_CLIENT_ID!,
    Authorization: `Bearer ${process.env.IGDB_TOKEN!}`,
    "Content-Type": "text/plain",
    Accept: "application/json",
  },
});

export const isDLC = [1, 2, 4];

export const ExcludeGameType = [14, 5];

export const IGDBPlatformIds = [167, 48, 6];

export const IGDBArtworks = [3, 1];

export const BUNDLE_GAME_TYPE = 3;

export const IGDBGame = {
  search: [
    IGDBGameField.Id,
    IGDBGameField.CoverImageId,
    IGDBGameField.Platforms,
    IGDBGameField.GameType,
    IGDBGameField.Name,
    IGDBGameField.FirstReleaseDate,
  ],

  getById: [
    IGDBGameField.Id,
    IGDBGameField.Name,
    IGDBGameField.ParentGame,
    IGDBGameField.CoverImageId,
    IGDBGameField.PlatformsInfo,
    IGDBGameField.GameType,
    IGDBGameField.FirstReleaseDate,
    IGDBGameField.Summary,
    IGDBGameField.GenresName,
    IGDBGameField.DlcsInfo,
    IGDBGameField.ExpansionsInfo,
    IGDBGameField.ExternalGamesInfo,
    IGDBGameField.ArtworksInfo,
  ],

  bundleItems: [
    IGDBGameField.Id,
    IGDBGameField.Name,
    IGDBGameField.ParentGame,
    IGDBGameField.CoverImageId,
    IGDBGameField.PlatformsInfo,
    IGDBGameField.GameType,
    IGDBGameField.Summary,
    IGDBGameField.GenresName,
    IGDBGameField.FirstReleaseDate,
    IGDBGameField.ExternalGamesInfo,
    IGDBGameField.ArtworksInfo,
  ],

  getByIdTest: [
    IGDBGameField.Id,
    IGDBGameField.Name,
    IGDBGameField.ParentGame,
    IGDBGameField.CoverImageId,
    IGDBGameField.PlatformsInfo,
    IGDBGameField.GameType,
    IGDBGameField.FirstReleaseDate,
    IGDBGameField.Summary,
    IGDBGameField.GenresName,
    IGDBGameField.DlcsInfo,
    IGDBGameField.ExpansionsInfo,
    // IGDBGameField.ExternalGamesInfo,
    IGDBGameField.ArtworksInfo,
    IGDBGameField.BundlesAll,
  ],

  test: [
    IGDBGameField.Id,
    IGDBGameField.Name,
    IGDBGameField.CoverAll,
    IGDBGameField.PlatformsAll,
    IGDBGameField.GameTypeAll,
    IGDBGameField.ScreenshotsAll,
    IGDBGameField.ArtworksAll,
    IGDBGameField.FirstReleaseDate,
    IGDBGameField.ExternalGamesInfo,
  ],
};

export const formatImage = (id: string, size: IGDBCoverSizeType) =>
  `https://images.igdb.com/igdb/image/upload/${size}/${id}.jpg`;

export const getFullYear = (date: number | null) =>
  date ? new Date(Number(date) * 1000).getFullYear() : null;

export const getDate = (date: number | null) =>
  date ? new Date(Number(date) * 1000) : null;

export const getBestIGDBArtwork = (
  artworks: Artworks[] | undefined,
): Artworks["image_id"] | null => {
  if (!artworks?.length) return null;

  return (
    artworks.find(
      (a) =>
        IGDBArtworks.includes(a.artwork_type) &&
        a.width === 1920 &&
        a.height === 620,
    )?.image_id ??
    artworks.find(
      (a) =>
        IGDBArtworks.includes(a.artwork_type) &&
        a.width >= 1000 &&
        a.height >= 620,
    )?.image_id ??
    artworks.find((a) => a.width >= 1000 && a.height >= 620)?.image_id ??
    artworks[0].image_id ??
    null
  );
};

export const getBundleContents = async (bundleId: number) => {
  const body = `
    fields ${IGDBGame.bundleItems};
    where bundles = (${bundleId});
    limit 500;
  `;

  const response = await igdb.post<IGDBGetByIdType[]>("/games", body);
  return response.data;
};

export const getSteamAppId = (externalGames: IGDBGameLike["external_games"]) =>
  externalGames?.find(
    (g) => g.external_game_source === 1 && STEAM_URL_REGEX.test(g.url),
  )?.uid ?? null;

export const resolveCoverImage = async (
  steamAppId: number | null,
  artworks: IGDBGameLike["artworks"],
) => {
  const artwork = getBestIGDBArtwork(artworks);
  const fallback = artwork
    ? formatImage(artwork, IGDBCoverSizeType.t_1080p)
    : null;

  if (steamAppId === null) return fallback;

  return (
    (await resolveSteamImage(steamAppId, SteamImageSizeType.hero)) ?? fallback
  );
};

// Single formatter used for the main game, its DLCs/expansions and bundle items,
// so every entry has exactly the same shape.
export const formatGame = async (
  game: IGDBGameLike,
  opts?: { isDlc?: boolean },
) => {
  const steamAppId = getSteamAppId(game.external_games);
  const gameType = game.game_type ?? null;
  const isDlc = opts?.isDlc ?? (gameType !== null && isDLC.includes(gameType));

  return {
    id: game.id,
    name: game.name,
    image: game.cover
      ? formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p)
      : null,
    coverImage: await resolveCoverImage(steamAppId, game.artworks),
    steamAppId,
    gameType,
    isDlc,
    parentGameIgdbId: isDlc ? (game.parent_game ?? null) : null,
    releaseDate: getDate(game.first_release_date),
  };
};

export const getBundleItemsDeep = async (
  bundleId: number,
  seen: Set<number> = new Set(),
): Promise<IGDBGetByIdType[]> => {
  if (seen.has(bundleId)) return [];
  seen.add(bundleId);

  const items = await getBundleContents(bundleId);

  const resolved = await Promise.all(
    items.map((item) =>
      item.game_type === BUNDLE_GAME_TYPE
        ? getBundleItemsDeep(item.id, seen)
        : Promise.resolve([item]),
    ),
  );

  // A game can appear in several nested bundles, so keep one entry per id.
  return [...new Map(resolved.flat().map((i) => [i.id, i])).values()];
};
