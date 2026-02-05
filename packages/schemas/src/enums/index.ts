export enum PlatformEnum {
  "PC" = "PC",
  "PS" = "PS",
}

export enum StatusEnum {
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

// values
export const platformValues = Object.values(
  PlatformEnum,
) as readonly PlatformEnum[];

export const statusValues = Object.values(StatusEnum) as readonly StatusEnum[];
