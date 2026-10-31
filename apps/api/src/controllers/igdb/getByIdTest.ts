import { GenericErrorMessage } from "@/constants";
import { IGDBGetByIdType } from "@repo/schemas/types/igdb";
import type { Request, Response } from "express";

import {
  BUNDLE_GAME_TYPE,
  formatGame,
  getBundleItemsDeep,
  igdb,
  IGDBGame,
} from "@/lib/igdb";

export const getByIdTest = async (req: Request, res: Response) => {
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
    const isBundle = game.game_type === BUNDLE_GAME_TYPE;

    const addons = [...(game.dlcs ?? []), ...(game.expansions ?? [])];

    const [main, dlcs, bundleItems] = await Promise.all([
      formatGame(game),
      Promise.all(addons.map((a) => formatGame(a, { isDlc: true }))),
      isBundle
        ? getBundleItemsDeep(game.id).then((items) =>
            Promise.all(items.map((item) => formatGame(item))),
          )
        : Promise.resolve([] as Awaited<ReturnType<typeof formatGame>>[]),
    ]);

    return res.status(200).json({
      ...main,
      platforms: game.platforms ?? [],
      summary: game.summary ?? null,
      genres: game.genres ?? [],
      dlcs,
      isBundle,
      bundleItems,
      bundleGames: bundleItems.filter((i) => !i.isDlc),
      bundleDlcs: bundleItems.filter((i) => i.isDlc),
    });
  } catch (err) {
    req.log.error({ err }, "IGDB_GET_BY_ID_TEST_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
