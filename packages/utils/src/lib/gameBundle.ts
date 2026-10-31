import { CreateCollectionBundleSchemaType } from "@repo/schemas/schemas/collection";
import { GetByIdClientResponse } from "@repo/schemas/types/igdb";

export const toCents = (n: number) => Math.round(n * 100);

/**
 * Splits a total across `count` games in cents so the shares always add up
 * to the total (e.g. 100 / 3 -> 33.34, 33.33, 33.33).
 */
export const splitAmount = (total: number, count: number): string[] => {
  if (count <= 0) return [];
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / count);
  const remainder = cents - base * count;

  return Array.from({ length: count }, (_, i) =>
    ((base + (i < remainder ? 1 : 0)) / 100).toFixed(2),
  );
};

export const parseAmount = (
  value: string | null | undefined,
): number | null => {
  if (!value || !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

/**
 * Builds the bundle's games. A DLC belongs to a game through parentGameIgdbId.
 * With a single game the bundle's own artwork is used, with several games each
 * game keeps its own artwork.
 */
export const buildCollections = (
  game: GetByIdClientResponse,
): CreateCollectionBundleSchemaType["collections"] => {
  const single = game.bundleGames.length === 1;

  return game.bundleGames.map((g) => ({
    igdbId: g.id,
    name: single ? game.name : g.name,
    amount: null,
    edition: null,
    image: single ? game.image : g.image,
    coverImage: single ? game.coverImage : g.coverImage,
    steamAppId: g.steamAppId ? String(g.steamAppId) : null,
    DLCs: game.bundleDlcs
      .filter((d) => d.parentGameIgdbId === g.id)
      .map((d) => ({
        igdbId: d.id,
        name: d.name,
        amount: null,
        dateOfPurchase: null,
        image: d.image,
        coverImage: d.coverImage,
        steamAppId: d.steamAppId ? String(d.steamAppId) : null,
        ownershipType: "Included" as const,
      })),
  }));
};
