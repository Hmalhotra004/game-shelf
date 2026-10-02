import {
  CollectionStatusType,
  CompletionStyleType,
  OwnershipType,
  PlatformType,
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

export const PLATFORM_OPTIONS = opts<PlatformType>("PC", "PS", "XBOX");

export const PC_PROVIDER_OPTIONS: Option<ProviderType>[] = [
  { value: "Steam", label: "Steam" },
  { value: "Epic", label: "Epic Games" },
];

export const PS_PROVIDER_OPTIONS: Option<ProviderType>[] = [
  { value: "PSN", label: "PlayStation Store" },
  { value: "Physical", label: "Physical" },
];

export const XBOX_PROVIDER_OPTIONS: Option<ProviderType>[] = [
  { value: "XBOX", label: "XBOX" },
  { value: "Physical", label: "Physical" },
];

/* ---------- Conditional lists ---------- */

export const getAfterCompletionStatusOptions = (isDLC = false): Option[] => [
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
}): Option[] => [
  ...(completions === 0
    ? opts<CollectionStatusType>("Backlog", "Dropped")
    : []),
  ...opts<CollectionStatusType>("Online", "On Hold", "Playing"),
  ...getAfterCompletionStatusOptions(isDLC),
];

export const getOwnershipTypeOptions = (isDlc = false): Option[] => [
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
