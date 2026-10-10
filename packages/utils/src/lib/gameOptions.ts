import {
  CollectionStatusType,
  CompletionStyleType,
  OwnershipType,
  PlatformType,
  PlaythroughStatusType,
  ProviderType,
  PSVersionType,
} from "@repo/schemas/types/index";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

// Helper to cut repetition when value === label
export const opts = <T extends string>(...values: T[]): Option<T>[] =>
  values.map((value) => ({ value, label: value }));

/* ---------- Static lists ---------- */

export const COMPLETION_STYLE_OPTIONS = opts<CompletionStyleType>(
  "Speed Run",
  "Story",
  "Story + Some Extras",
  "Story + Lots of Extras",
  "Completionated",
  "NG+ Run",
  "Challenge Run",
  "Achievement Run",
);

export const PS_VERSION_OPTIONS = opts<PSVersionType>(
  "PS5",
  "PS4",
  "PS3",
  "PS2",
  "PS1",
);

export const PLAYTHROUGH_STATUS_OPTIONS = opts<PlaythroughStatusType>(
  "Active",
  "On Hold",
  "Archived",
  "Completed",
);

export const PLATFORM_OPTIONS = opts<PlatformType>("PC", "PS", "XBOX");

export const PROVIDER_OPTIONS: Record<PlatformType, Option<ProviderType>[]> = {
  PC: [
    { value: "Steam", label: "Steam" },
    { value: "Epic", label: "Epic Games" },
  ],
  PS: [
    { value: "PSN", label: "PlayStation Store" },
    { value: "Physical", label: "Physical" },
  ],
  XBOX: [
    { value: "XBOX", label: "XBOX" },
    { value: "Physical", label: "Physical" },
  ],
};

/* ---------- Conditional lists ---------- */

export const getAfterCompletionStatusOptions = (
  isDLC = false,
): Option<CollectionStatusType>[] => [
  ...opts<CollectionStatusType>("Story Completed", "Platinum"),
  ...(isDLC ? [] : opts<CollectionStatusType>("Platinum+")),
  ...opts<CollectionStatusType>("100% Completed"),
];

export const getGameStatusOptions = ({
  completions,
  isDLC = false,
}: {
  completions: number;
  isDLC?: boolean;
}): Option<CollectionStatusType>[] => [
  ...(completions === 0
    ? opts<CollectionStatusType>("Backlog", "Dropped")
    : []),
  ...opts<CollectionStatusType>("Online", "On Hold", "Playing"),
  ...getAfterCompletionStatusOptions(isDLC),
];

export const getOwnershipTypeOptions = (
  isDlc = false,
): Option<OwnershipType>[] => [
  ...opts<OwnershipType>("Free", "Gift"),
  ...(isDlc ? opts<OwnershipType>("Included") : []),
  ...opts<OwnershipType>(
    "Bought",
    "Rented",
    "PS+",
    "Steam Family",
    "Game Pass",
  ),
];

/* ---------- Filters ---------- */

const withAll = <T extends string>(
  options: Option<T>[],
): Option<T | "ALL">[] => [{ value: "ALL", label: "All" }, ...options];

export const PLATFORM_FILTER_OPTIONS = withAll(PLATFORM_OPTIONS);

export const GAME_STATUS_FILTER_OPTIONS = withAll(
  getGameStatusOptions({ completions: 0, isDLC: true }),
);

export const OWNERSHIP_FILTER_OPTIONS = withAll(getOwnershipTypeOptions(false));
export const COMPLETION_STYLE_FILTER_OPTIONS = withAll(
  COMPLETION_STYLE_OPTIONS,
);
