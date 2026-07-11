import { Artworks } from "@repo/schemas/types/igdb";
import axios from "axios";
import { IGDBCoverSizeType, IGDBGameField } from "./enum";

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
