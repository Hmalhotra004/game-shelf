import { GameType, PlatformType } from "./index";

export type getOverViewStatResponse = {
  totalGames: number;
  totalDLCs: number;
  totalPlaytimeHours: number;
  totalSpent: number;
  activePlaythroughs: number;
  completedGames: number;
};

export type WeeklyPlaytimeResponse = {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  activeDays: number;
  previousWeekTotalSeconds: number;
  days: {
    date: string;
    seconds: number;
    sessions: number;
  }[];
  streak: {
    current: number;
    playedToday: boolean;
  };
};

export type HomePickNextItem = {
  id: string;
  gameType: GameType;
  name: string;
  parentName: string | null;
  image: string | null;
  collectionId: string;
  platform: PlatformType;
  addedAt: string;
};

export type HomePickNextResponse = {
  oldest: HomePickNextItem | null;
  random: HomePickNextItem | null;
};

// ------------------------------- Home: recent activity -------------------------------
export type HomeActivityKind =
  "Completed" | "GameAdded" | "DLCAdded" | "PlaythroughStarted";

export type HomeActivityItem = {
  // unique per event, e.g. "Completed:<completionId>"
  id: string;
  kind: HomeActivityKind;
  gameType: GameType;
  name: string;
  // parent game name when the event is about a DLC
  parentName: string | null;
  image: string | null;
  // the game itself, or the parent game when the event is about a DLC
  collectionId: string;
  occurredAt: string;
};

export type HomeActivityResponse = {
  items: HomeActivityItem[];
};

// ------------------------------- Home: on hold -------------------------------
export type HomeOnHoldItem = {
  // "Playthrough": a playthrough with status On Hold
  // "Collection": a game/DLC with status On Hold and no On Hold playthrough
  source: "Playthrough" | "Collection";
  // playthrough id, or collection/dlc id for source "Collection"
  id: string;
  gameType: GameType;
  name: string;
  parentName: string | null;
  image: string | null;
  collectionId: string;
  // collection/dlc id, used to start a playthrough for source "Collection"
  targetId: string;
  notes: string | null;
  totalSeconds: number;
  lastPlayedAt: string;
};

export type HomeOnHoldResponse = {
  items: HomeOnHoldItem[];
  total: number;
};
