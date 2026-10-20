import { db } from "@/db";
import { collection, dlc } from "@/db/schema";
import { logger } from "@/lib/logger";
import { normalize } from "@/lib/utils";
import axios from "axios";
import { and, eq, ne } from "drizzle-orm";
import type { Logger } from "pino";

const STORE_API = "https://store.steampowered.com/api";
const REQUEST_DELAY_MS = 350; // Store API is rate limited, stay well under it
const MAX_EXACT_CANDIDATES = 5;

export type ResolveSteamAppIdPayload = {
  collectionId: string;
  userId: string;
};

type SteamAppDetails = {
  type: string; // "game" | "dlc" | "demo" | "music" | ...
  name: string;
  steam_appid: number;
  dlc?: number[]; // present on a game: the app IDs of its DLC
};

type SteamSearchItem = { id: number; name: string };

type Verdict = "correct" | "incorrect" | "unknown";
type GameStatus =
  "unchanged" | "added" | "corrected" | "not_found" | "conflict" | "skipped";

type Log = Logger;

// ---------------------------------------------------------------------------
// Steam Store client (per run, so the details cache lives only for one job)
// ---------------------------------------------------------------------------

function createSteamClient() {
  const http = axios.create({ timeout: 10_000 });
  const cache = new Map<string, SteamAppDetails | null>();
  let lastCall = 0;

  const throttle = async () => {
    const wait = lastCall + REQUEST_DELAY_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
  };

  return {
    // null = Steam has no public data for this ID (region locked / delisted / bad ID)
    // Network errors and 429s are thrown so pg-boss retries the job.
    async getDetails(appId: string): Promise<SteamAppDetails | null> {
      if (cache.has(appId)) return cache.get(appId) ?? null;

      await throttle();
      const res = await http.get(`${STORE_API}/appdetails`, {
        params: { appids: appId, l: "english" },
      });

      const entry = res.data?.[appId];
      const details: SteamAppDetails | null = entry?.success
        ? entry.data
        : null;
      cache.set(appId, details);
      return details;
    },

    async search(term: string): Promise<SteamSearchItem[]> {
      await throttle();
      const res = await http.get(`${STORE_API}/storesearch/`, {
        params: { term, l: "english", cc: "us" },
      });
      return res.data?.items ?? [];
    },
  };
}

type SteamClient = ReturnType<typeof createSteamClient>;

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------

// Loose on purpose: only used to sanity check an ID that is already saved.
const namesMatch = (a: string, b: string) => {
  const x = normalize(a);
  const y = normalize(b);
  return x === y || x.includes(y) || y.includes(x);
};

async function verifyGame(
  steam: SteamClient,
  appId: string,
  needle: string,
): Promise<Verdict> {
  const details = await steam.getDetails(appId);
  if (!details) return "unknown"; // can't prove it wrong, so don't touch it
  if (details.type !== "game") return "incorrect";
  return namesMatch(details.name, needle) ? "correct" : "incorrect";
}

// Strict on purpose: a wrong ID is worse than a missing one.
async function findGameId(
  steam: SteamClient,
  name: string,
  needle: string,
  log: Log,
): Promise<string | null> {
  const items = await steam.search(name);
  const exact = items
    .filter((i) => normalize(i.name) === needle)
    .slice(0, MAX_EXACT_CANDIDATES);

  const games: string[] = [];
  for (const item of exact) {
    const details = await steam.getDetails(String(item.id));
    if (details?.type === "game") games.push(String(item.id));
  }

  if (games.length === 1) return games[0];

  if (games.length > 1) {
    log.warn({ games }, "RESOLVE_STEAM_APP_ID_GAME_AMBIGUOUS");
  }
  return null;
}

// ---------------------------------------------------------------------------
// DLC
// ---------------------------------------------------------------------------

async function resolveDlcs(
  steam: SteamClient,
  {
    collectionId,
    userId,
    gameAppId,
  }: { collectionId: string; userId: string; gameAppId: string },
  log: Log,
) {
  const dlcs = await db
    .select({ id: dlc.id, name: dlc.name, steamAppId: dlc.steamAppId })
    .from(dlc)
    .where(and(eq(dlc.collectionId, collectionId), eq(dlc.userId, userId)));

  if (!dlcs.length) return { updated: 0, unresolved: 0 };

  // The parent's DLC list is the source of truth for which IDs are valid DLC
  const parent = await steam.getDetails(gameAppId);
  if (!parent) {
    log.warn({ gameAppId }, "RESOLVE_STEAM_APP_ID_PARENT_UNAVAILABLE");
    return { updated: 0, unresolved: dlcs.length };
  }
  const parentDlcIds = new Set((parent.dlc ?? []).map(String));

  let updated = 0;
  let unresolved = 0;

  for (const row of dlcs) {
    const needle = normalize(row.name);
    const existingId = row.steamAppId ? String(row.steamAppId) : null;

    // 1. Existing ID: keep it if it belongs to this game and the name fits
    if (existingId && parentDlcIds.has(existingId)) {
      const details = await steam.getDetails(existingId);
      if (!details || namesMatch(details.name, needle)) continue;
    }

    // 2. Missing or wrong: search by name, accept only IDs from the parent's DLC list
    const items = await steam.search(row.name);
    const matches = items.filter(
      (i) => parentDlcIds.has(String(i.id)) && normalize(i.name) === needle,
    );

    if (matches.length !== 1) {
      unresolved++;
      log.warn(
        { dlcId: row.id, name: row.name, matches: matches.map((m) => m.name) },
        matches.length
          ? "RESOLVE_STEAM_APP_ID_DLC_AMBIGUOUS"
          : "RESOLVE_STEAM_APP_ID_DLC_NOT_FOUND",
      );
      continue;
    }

    const foundId = String(matches[0].id);
    if (foundId === existingId) continue;

    await db
      .update(dlc)
      .set({ steamAppId: foundId })
      .where(and(eq(dlc.id, row.id), eq(dlc.userId, userId)));
    updated++;
  }

  return { updated, unresolved };
}

// ---------------------------------------------------------------------------
// Main job logic. No pg-boss in here.
// ---------------------------------------------------------------------------

export async function resolveSteamAppId({
  collectionId,
  userId,
}: ResolveSteamAppIdPayload) {
  const log = logger.child({ collectionId });

  const [game] = await db
    .select({
      name: collection.name,
      platform: collection.platform,
      provider: collection.provider,
      steamAppId: collection.steamAppId,
    })
    .from(collection)
    .where(and(eq(collection.id, collectionId), eq(collection.userId, userId)));

  if (!game) {
    log.warn("RESOLVE_STEAM_APP_ID_COLLECTION_NOT_FOUND");
    return { game: "skipped" as GameStatus, dlcUpdated: 0, dlcUnresolved: 0 };
  }

  const steam = createSteamClient();
  const needle = normalize(game.name);
  const existingId = game.steamAppId ? String(game.steamAppId) : null;

  let gameAppId = existingId;
  let gameStatus: GameStatus = "unchanged";
  let gameTrusted = false;

  const verdict = existingId
    ? await verifyGame(steam, existingId, needle)
    : null;

  if (verdict === "correct" || verdict === "unknown") {
    gameTrusted = true;
  } else {
    // No ID yet, or the saved one is wrong: look for the right one
    const foundId = await findGameId(steam, game.name, needle, log);

    if (!foundId) {
      gameStatus = "not_found";
      log.warn({ existingId, verdict }, "RESOLVE_STEAM_APP_ID_GAME_NOT_FOUND");
    } else {
      // user_steam_game_unique: don't hand the same Steam app to two entries
      const [duplicate] = await db
        .select({ id: collection.id })
        .from(collection)
        .where(
          and(
            eq(collection.userId, userId),
            eq(collection.provider, game.provider),
            eq(collection.steamAppId, foundId),
            ne(collection.id, collectionId),
          ),
        )
        .limit(1);

      if (duplicate) {
        gameStatus = "conflict";
        log.warn(
          { foundId, conflictingCollectionId: duplicate.id },
          "RESOLVE_STEAM_APP_ID_DUPLICATE",
        );
      } else {
        await db
          .update(collection)
          .set({ steamAppId: foundId })
          .where(
            and(eq(collection.id, collectionId), eq(collection.userId, userId)),
          );
        gameAppId = foundId;
        gameStatus = existingId ? "corrected" : "added";
        gameTrusted = true;
      }
    }
  }

  // DLC IDs are only meaningful relative to a trusted parent ID
  const dlcResult =
    gameTrusted && gameAppId
      ? await resolveDlcs(steam, { collectionId, userId, gameAppId }, log)
      : { updated: 0, unresolved: 0 };

  log.info(
    {
      game: gameStatus,
      gameAppId,
      dlcUpdated: dlcResult.updated,
      dlcUnresolved: dlcResult.unresolved,
    },
    "RESOLVE_STEAM_APP_ID_RESULT",
  );

  return {
    game: gameStatus,
    dlcUpdated: dlcResult.updated,
    dlcUnresolved: dlcResult.unresolved,
  };
}
