import { PSVersionTrophyType } from ".";
import { PSNTrophyType } from "./psn";
import { steamRarityType } from "./steam";

export type TrophiesType = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  iconGray: string | null;
  type: PSNTrophyType;
  rarity: steamRarityType;
  hidden: boolean;
  achieved: boolean;
  unlockTime: string | null;
};

export type TrophiesResponse = {
  version: PSVersionTrophyType | null;
  total: number;
  unlocked: number;
  groups: {
    total: number;
    unlocked: number;
    id: string;
    name: string;
    isDLC: boolean;
    trophies: TrophiesType[];
  };
};
