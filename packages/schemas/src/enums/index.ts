export enum GameTypeEnum {
  "Game" = "Game",
  "DLC" = "DLC",
}

export enum PlatformEnum {
  "PC" = "PC",
  "PS" = "PS",
}

export enum PsVersionEnum {
  "PS4" = "PS4",
  "PS5" = "PS5",
}

export enum ProviderEnum {
  "PSN" = "PSN",
  "Physical" = "Physical",
  "Steam" = "Steam",
  "Epic" = "Epic",
}

export enum OwnershipTypeEnum {
  "Free" = "Free",
  "Gift" = "Gift",
  "Bought" = "Bought",
  "Rented" = "Rented",
  "PS+" = "PS+",
  "Steam Family" = "Steam Family",
  "Game Pass" = "Game Pass",
}

export enum CollectionStatusEnum {
  "Online" = "Online",
  "Backlog" = "Backlog",
  "Playing" = "Playing",
  "On Hold" = "On Hold",
  "Dropped" = "Dropped",
  "Story Completed" = "Story Completed",
  "Platinum" = "Platinum",
  "Platinum+" = "Platinum+",
  "100% Completed" = "100% Completed",
}

export enum PlaythroughStatusEnum {
  "Active" = "Active",
  "On Hold" = "On Hold",
  "Archived" = "Archived",
}

export enum CompletionStyleEnum {
  "Speed Run" = "Speed Run",
  "Story" = "Story",
  "Story + Some Extras" = "Story + Some Extras",
  "Story + Lots of Extras" = "Story + Lots of Extras",
  "Completionated" = "Completionated",
  "NG+ Run" = "NG+ Run",
  "Challenge Run" = "Challenge Run",
  "Achievement Run" = "Achievement Run",
}

export enum SyncTypeEnum {
  "PLATINUM" = "PLATINUM",
  "MASTERED" = "MASTERED",
}

export enum SyncTypeStatusEnum {
  "Failed" = "Failed",
  "Running" = "Running",
  "Completed" = "Completed",
}

export enum UserAccountEnum {
  "User" = "User",
  "Admin" = "Admin",
}

// values
export const platformValues = Object.values(
  PlatformEnum,
) as readonly PlatformEnum[];

export const providerValues = Object.values(
  ProviderEnum,
) as readonly ProviderEnum[];

export const ownershipTypeValues = Object.values(
  OwnershipTypeEnum,
) as readonly OwnershipTypeEnum[];

export const collectionStatusValues = Object.values(
  CollectionStatusEnum,
) as readonly CollectionStatusEnum[];

export const psVersionValues = Object.values(
  PsVersionEnum,
) as readonly PsVersionEnum[];

export const gameTypeValues = Object.values(
  GameTypeEnum,
) as readonly GameTypeEnum[];

export const playthroughStatusValues = Object.values(
  PlaythroughStatusEnum,
) as readonly PlaythroughStatusEnum[];

export const completionStyleValues = Object.values(
  CompletionStyleEnum,
) as readonly CompletionStyleEnum[];

export const syncTypeValues = Object.values(
  SyncTypeEnum,
) as readonly SyncTypeEnum[];

export const syncTypeStatusValues = Object.values(
  SyncTypeStatusEnum,
) as readonly SyncTypeStatusEnum[];

export const userAccountTypeValues = Object.values(
  UserAccountEnum,
) as readonly UserAccountEnum[];

// filters
export const playthroughStatusFilterValues = [
  "Active",
  "Archived",
  "On Hold",
  "All",
] as const;
