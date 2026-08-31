export const GameTypeValues = ["Game", "DLC"] as const;

export const PlatformValues = ["PC", "XBOX", "PS"] as const;

export const PSVersionValues = ["PS5", "PS4", "PS3", "PS2", "PS1"] as const;

export const ProviderValues = [
  "PSN",
  "XBOX",
  "Physical",
  "Steam",
  "Epic",
] as const;

export const OwnershipTypeValues = [
  "Bought",
  "Gift",
  "Free",
  "Included",
  "Rented",
  "PS+",
  "Steam Family",
  "Game Pass",
] as const;

export const CollectionStatusValues = [
  "Online",
  "Backlog",
  "Playing",
  "On Hold",
  "Dropped",
  "Story Completed",
  "Platinum",
  "Platinum+",
  "100% Completed",
] as const;

export const CompletionStatusValues = [
  "Story Completed",
  "Platinum",
  "Platinum+",
  "100% Completed",
] as const;

export const PlaythroughStatusValues = [
  "Active",
  "On Hold",
  "Archived",
] as const;

export const CompletionStyleValues = [
  "Speed Run",
  "Story",
  "Story + Some Extras",
  "Story + Lots of Extras",
  "Completionated",
  "NG+ Run",
  "Challenge Run",
  "Achievement Run",
] as const;

export const SyncTypeValues = ["PLATINUM", "MASTERED"] as const;

export const SyncTypeStatusValues = ["Failed", "Running", "Completed"] as const;

export const UserAccountTypeValues = ["User", "Admin"] as const;
