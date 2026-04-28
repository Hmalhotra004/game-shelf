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

export const ExcludeGameType = [14, 5];

export const IGDBPlatformIds = [167, 48, 6];

export const IGDBGame = {
  search: [
    IGDBGameField.Id,
    IGDBGameField.CoverImageId,
    IGDBGameField.Platforms,
    IGDBGameField.GameType,
    IGDBGameField.Name,
    IGDBGameField.FirstReleaseDate,
  ],

  test: [
    IGDBGameField.Id,
    IGDBGameField.Name,
    IGDBGameField.CoverAll,
    IGDBGameField.PlatformsAll,
    IGDBGameField.GameTypeAll,
    IGDBGameField.ScreenshotsAll,
    IGDBGameField.ArtworksAll,
    IGDBGameField.Status,
    IGDBGameField.FirstReleaseDate,
  ],
};

export const formatImage = (id: string, size: IGDBCoverSizeType) =>
  `https://images.igdb.com/igdb/image/upload/${size}/${id}.jpg`;

export const getFullYear = (date: number | null) =>
  date ? new Date(Number(date) * 1000).getFullYear() : null;
