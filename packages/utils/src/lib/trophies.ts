import type {
  TrophiesResponse,
  TrophiesType,
} from "@repo/schemas/types/trophies";

export type TrophyFilter = "all" | "unlocked" | "locked";

type TrophyGroup = TrophiesResponse["groups"][number];

export type TrophyListRow =
  | {
      kind: "header";
      key: string;
      name: string;
      unlocked: number;
      total: number;
    }
  | { kind: "trophy"; key: string; trophy: TrophiesType };

/** Tier colours have no semantic theme token, so they live here. */
export const TROPHY_COLORS: Record<string, string> = {
  platinum: "#67e8f9",
  gold: "#fbbf24",
  silver: "#cbd5e1",
  bronze: "#ea580c",
  Common: "#a1a1aa",
  Uncommon: "#22c55e",
  Rare: "#3b82f6",
  "Ultra Rare": "#a855f7",
};

const PS_ORDER = ["platinum", "gold", "silver", "bronze"];
const STEAM_ORDER = ["Common", "Uncommon", "Rare", "Ultra Rare"];

export const getCategoryOrder = (isPS: boolean) =>
  isPS ? PS_ORDER : STEAM_ORDER;

export const getCategory = (trophy: TrophiesType, isPS: boolean): string =>
  isPS ? trophy.type : trophy.rarity;

export const formatCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1);

export const formatUnlockedDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const isBaseGame = (group: TrophyGroup) =>
  group.id === "default" && !group.isDLC;

/** Unlocked / total per tier (PS) or rarity (Steam), across all groups. */
export function getCategoryCounts(groups: TrophyGroup[], isPS: boolean) {
  const counts = new Map<string, { unlocked: number; total: number }>();

  for (const group of groups) {
    for (const trophy of group.trophies) {
      const category = getCategory(trophy, isPS);
      const entry = counts.get(category) ?? { unlocked: 0, total: 0 };
      entry.total += 1;
      if (trophy.achieved) entry.unlocked += 1;
      counts.set(category, entry);
    }
  }

  return getCategoryOrder(isPS)
    .filter((category) => counts.has(category))
    .map((category) => ({ category, ...counts.get(category)! }));
}

/** Flattens groups into header + trophy rows for a single FlashList. */
export function buildTrophyRows(
  version: TrophiesResponse,
  isPS: boolean,
  filter: TrophyFilter,
): TrophyListRow[] {
  const order = getCategoryOrder(isPS);
  const rank = (t: TrophiesType) => {
    const i = order.indexOf(getCategory(t, isPS));
    return i === -1 ? 99 : i;
  };

  const matches = (t: TrophiesType) =>
    filter === "all" || (filter === "unlocked" ? t.achieved : !t.achieved);

  const compare = (a: TrophiesType, b: TrophiesType) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;

    if (a.achieved && b.achieved) {
      const ta = a.unlockTime ? new Date(a.unlockTime).getTime() : 0;
      const tb = b.unlockTime ? new Date(b.unlockTime).getTime() : 0;
      if (ta !== tb) return tb - ta; // newest unlock first
    }

    return a.name.localeCompare(b.name);
  };

  // Base game always first
  const groups = [...version.groups].sort(
    (a, b) => Number(isBaseGame(b)) - Number(isBaseGame(a)),
  );
  const showHeaders = version.groups.length > 1;

  const rows: TrophyListRow[] = [];

  for (const group of groups) {
    const trophies = group.trophies.filter(matches).sort(compare);
    if (trophies.length === 0) continue;

    if (showHeaders) {
      rows.push({
        kind: "header",
        key: `group-${group.id}`,
        name: group.name,
        unlocked: group.unlocked,
        total: group.total,
      });
    }

    for (const trophy of trophies) {
      rows.push({
        kind: "trophy",
        key: `${group.id}-${trophy.id}`,
        trophy,
      });
    }
  }

  return rows;
}
