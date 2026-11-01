import { steamRarityType } from "@repo/schemas/types/steam";
import { TrophyType } from "psn-api";

export const rarityMap: Record<TrophyType, steamRarityType> = {
  bronze: "Common",
  silver: "Uncommon",
  gold: "Rare",
  platinum: "Ultra Rare",
} as const;

export function trophyTypeMap(percent: number): TrophyType {
  if (percent >= 50) return "bronze";
  if (percent >= 20) return "silver";
  if (percent >= 10) return "gold";
  return "platinum";
}

export function steamRarity(percent: number): steamRarityType {
  if (percent >= 50) return "Common";
  if (percent >= 20) return "Uncommon";
  if (percent >= 10) return "Rare";
  return "Ultra Rare";
}
