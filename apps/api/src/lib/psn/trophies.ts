import { rarityMap } from "@/lib/trophyTypeMap";
import { PSVersionTrophyType } from "@repo/schemas/types/index";

import {
  getTitleTrophies,
  getTitleTrophyGroups,
  getUserTrophiesEarnedForTitle,
  type AuthorizationPayload,
  type TitleTrophiesResponse,
  type TitleTrophyGroupsResponse,
} from "psn-api";

export const PS_VERSION_ORDER: PSVersionTrophyType[] = ["PS5", "PS4", "PS3"];

// PS5 titles use the "trophy2" service, PS4/PS3 use "trophy".
export function getNpServiceName(version: PSVersionTrophyType) {
  return version === "PS5" ? "trophy2" : "trophy";
}

/** Trophy definitions + groups. Public data, no PSN account needed. */
export async function fetchTitleTrophies(
  authorization: AuthorizationPayload,
  npCommunicationId: string,
  version: PSVersionTrophyType,
): Promise<{
  trophies: TitleTrophiesResponse["trophies"];
  groups: TitleTrophyGroupsResponse["trophyGroups"];
}> {
  const options = { npServiceName: getNpServiceName(version) } as const;

  const [trophies, groups] = await Promise.all([
    getTitleTrophies(authorization, npCommunicationId, "all", options),
    getTitleTrophyGroups(authorization, npCommunicationId, options),
  ]);

  return {
    trophies: trophies.trophies,
    groups: groups.trophyGroups,
  };
}

export type EarnedTrophy = { earned: boolean; unlockTime: string | null };

/**
 * The player's unlock state, keyed by trophyId.
 * Rejects when unavailable (private profile, never played, etc) so the
 * caller can decide how to degrade.
 */
export async function fetchEarnedTrophies(
  authorization: AuthorizationPayload,
  accountId: string,
  npCommunicationId: string,
  version: PSVersionTrophyType,
): Promise<Map<number, EarnedTrophy>> {
  const res = await getUserTrophiesEarnedForTitle(
    authorization,
    accountId,
    npCommunicationId,
    "all",
    { npServiceName: getNpServiceName(version) },
  );

  return new Map(
    res.trophies.map((t) => [
      t.trophyId,
      {
        earned: t.earned ?? false,
        unlockTime: t.earned && t.earnedDateTime ? t.earnedDateTime : null,
      },
    ]),
  );
}

type TitleTrophies = Awaited<ReturnType<typeof fetchTitleTrophies>>;

/** Merge definitions with (optional) progress into the grouped UI shape. */
export function buildTrophyGroups(
  { trophies, groups }: TitleTrophies,
  progress: Map<number, EarnedTrophy> | null,
) {
  const groupsMap = new Map(
    groups.map((g) => [
      g.trophyGroupId,
      {
        id: g.trophyGroupId,
        name: g.trophyGroupId === "default" ? "Base Game" : g.trophyGroupName,
        isDLC: g.trophyGroupId !== "default",
        trophies: [] as ReturnType<typeof toUITrophy>[],
      },
    ]),
  );

  // Ensure base game group exists
  if (!groupsMap.has("default")) {
    groupsMap.set("default", {
      id: "default",
      name: "Base Game",
      isDLC: false,
      trophies: [],
    });
  }

  for (const t of trophies) {
    const group = groupsMap.get(t.trophyGroupId ?? "default");
    if (!group) continue;

    group.trophies.push(toUITrophy(t, progress?.get(t.trophyId)));
  }

  const result = Array.from(groupsMap.values()).map((g) => ({
    ...g,
    total: g.trophies.length,
    unlocked: g.trophies.filter((t) => t.achieved).length,
  }));

  return {
    total: result.reduce((sum, g) => sum + g.total, 0),
    unlocked: result.reduce((sum, g) => sum + g.unlocked, 0),
    groups: result,
  };
}

function toUITrophy(
  t: TitleTrophies["trophies"][number],
  earned: EarnedTrophy | undefined,
) {
  return {
    id: String(t.trophyId),
    name: t.trophyName ?? "trophy",
    description: t.trophyDetail ?? "",
    icon: t.trophyIconUrl,
    iconGray: t.trophyIconUrl,
    type: t.trophyType,
    rarity: rarityMap[t.trophyType],
    hidden: t.trophyHidden,
    achieved: earned?.earned ?? false,
    unlockTime: earned?.unlockTime ?? null,
  };
}
