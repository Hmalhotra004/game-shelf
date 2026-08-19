import { GenericErrorMessage, STEAM_URL_REGEX } from "@/constants";
import { IGDBCoverSizeType } from "@/lib/igdb/enum";
import { resolveSteamImage, SteamImageSizeType } from "@/lib/steam";
import { IGDBGetByIdType } from "@repo/schemas/types/igdb";
import type { Request, Response } from "express";

import {
  formatImage,
  getBestIGDBArtwork,
  getDate,
  igdb,
  IGDBGame,
  isDLC,
} from "@/lib/igdb";

// TODO: fetch and handle bundle dlcs
export const getById = async (req: Request, res: Response) => {
  try {
    const igdbId = Number(req.params.igdbId);

    if (!igdbId || Number.isNaN(igdbId)) {
      return res.status(400).json({ error: "Invalid IGDB ID" });
    }

    const body = `
    fields ${IGDBGame.getById};
    where id = ${igdbId};
    `;

    const response = await igdb.post<IGDBGetByIdType[]>("/games", body);

    if (!response.data.length) {
      return res.status(404).json({ error: "Game not found" });
    }

    const game = response.data[0];

    const steamGame = game.external_games?.find(
      (g) => g.external_game_source === 1 && STEAM_URL_REGEX.test(g.url),
    );

    const artwork = getBestIGDBArtwork(game.artworks);

    const getFallbackArtwork = () =>
      artwork ? formatImage(artwork, IGDBCoverSizeType.t_1080p) : null;

    const coverImage = steamGame
      ? ((await resolveSteamImage(steamGame.uid, SteamImageSizeType.hero)) ??
        getFallbackArtwork())
      : getFallbackArtwork();

    // const image = steamGame
    //   ? ((await resolveSteamImage(steamGame.uid, SteamImageSizeType.grid)) ??
    //     formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p))
    //   : formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p);

    const allAddons = [...(game.dlcs ?? []), ...(game.expansions ?? [])];

    const dlcs = await Promise.all(
      allAddons.map(async (dlc) => {
        const dlcSteamAppId =
          dlc.external_games?.find(
            (g) => g.external_game_source === 1 && STEAM_URL_REGEX.test(g.url),
          )?.uid ?? null;

        const dlcArtwork = getBestIGDBArtwork(dlc.artworks);

        const getDlcFallbackArtwork = () =>
          dlcArtwork
            ? formatImage(dlcArtwork, IGDBCoverSizeType.t_1080p)
            : null;

        const dlcCoverImage = dlcSteamAppId
          ? ((await resolveSteamImage(
              dlcSteamAppId,
              SteamImageSizeType.hero,
            )) ?? getDlcFallbackArtwork())
          : getDlcFallbackArtwork();

        return {
          id: dlc.id,
          name: dlc.name,
          image: formatImage(dlc.cover.image_id, IGDBCoverSizeType.t_1080p),
          coverImage: dlcCoverImage,
          releaseDate: getDate(dlc.first_release_date),
          steamAppId: dlcSteamAppId,
        };
      }),
    );

    const isDlc = isDLC.includes(game.game_type);

    const result = {
      id: game.id,
      name: game.name,
      image: formatImage(game.cover.image_id, IGDBCoverSizeType.t_1080p),
      coverImage,
      steamAppId: steamGame?.uid ?? null,
      platforms: game.platforms,
      summary: game.summary,
      releaseDate: getDate(game.first_release_date),
      genres: game.genres,
      gameType: game.game_type,
      parentGameIgdbId: isDLC ? game.parent_game : null,
      isDlc,
      dlcs,
    };

    res.status(200).json(result);
  } catch (err) {
    req.log.error({ err }, "IGDB_GET_BY_ID_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
