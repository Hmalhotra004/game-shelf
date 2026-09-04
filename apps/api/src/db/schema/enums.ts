import { pgEnum } from "drizzle-orm/pg-core";

export const GameType = pgEnum("game_type", ["Game", "DLC"]);
export const platform = pgEnum("platform", ["PS", "XBOX", "PC"]);
export const PSVersion = pgEnum("ps_version", [
  "PS5",
  "PS4",
  "PS3",
  "PS2",
  "PS1",
]);

export const provider = pgEnum("provider", [
  "PSN",
  "XBOX",
  "Physical",
  "Steam",
  "Epic",
]);

export const ownershipType = pgEnum("ownership_type", [
  "Bought",
  "Gift",
  "Free",
  "Included",
  "Rented",
  "PS+",
  "Steam Family",
  "Game Pass",
]);

export const playthroughStatus = pgEnum("playthrough_status", [
  "Active",
  "On Hold",
  "Archived",
]);

export const status = pgEnum("status", [
  "Online",
  "Backlog",
  "Playing",
  "On Hold",
  "Dropped",
  "Story Completed",
  "Platinum",
  "Platinum+",
  "100% Completed",
]);

export const completionStyle = pgEnum("completion_style", [
  "Speed Run",
  "Story",
  "Story + Some Extras",
  "Story + Lots of Extras",
  "Completionated",
  "NG+ Run",
  "Challenge Run",
  "Achievement Run",
]);

export const userAccount = pgEnum("UserAccount", ["User", "Admin"]);

// export const syncType = pgEnum("sync_type", ["PLATINUM", "MASTERED"]);

// export const syncTypeStatus = pgEnum("sync_type_status", [
//   "Failed",
//   "Running",
//   "Completed",
// ]);
