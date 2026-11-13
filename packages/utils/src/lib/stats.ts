import { format, parseISO } from "date-fns";

import {
  HomeActivityKind,
  PickNextModeType,
} from "@repo/schemas/types/homeStats";

export const PICK_NEXT_MODES: { value: PickNextModeType; label: string }[] = [
  { value: "oldest", label: "Oldest" },
  { value: "random", label: "Random" },
];

export const DAY_FORMAT = "yyyy-MM-dd";
export const MAX_OFFSET = 104; // keep in sync with weekStatsQuerySchema

export const formatRange = (start: string, end: string) =>
  `${format(parseISO(start), "d MMM")} – ${format(parseISO(end), "d MMM")}`;

export const HOME_ACTIVITY_KIND_LABEL: Record<HomeActivityKind, string> = {
  Completed: "Completed",
  GameAdded: "Added to collection",
  DLCAdded: "DLC added",
  PlaythroughStarted: "Started playing",
};
