import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  CollectionStatusType,
  PlaythroughStatusType,
} from "@repo/schemas/types/index";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusColorMap: Record<CollectionStatusType, string> = {
  Dropped: "border-red-500",
  Backlog: "border-yellow-500",
  Online: "border-blue-600",
  "On Hold": "border-orange-600",
  Playing: "border-green-600",
  "Story Completed": "border-blue-600",
  Platinum: "border-purple-600",
  "Platinum+": "border-purple-700",
  "100% Completed": "border-emerald-600",
};

export function getBorderColor(status: PlaythroughStatusType) {
  switch (status) {
    case "Active":
      return "border-emerald-600";
    case "On Hold":
      return "border-amber-500";
    case "Archived":
      return "border-rose-600";
  }
}

export function betterTimeText(seconds: number, withS?: boolean): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h === 0 && m === 0 && s === 0) return "0";

  // Only hours
  if (h > 0 && m === 0 && s === 0) {
    return `${h} h`;
  }

  // Only minutes
  if (h === 0 && m > 0 && s === 0) {
    return `${m} m`;
  }

  // Only seconds
  if (h === 0 && m === 0 && s > 0) {
    return `${s} s`;
  }

  // Mixed values
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (withS) {
    if (s > 0) parts.push(`${s}s`);
  }

  return parts.join(" ");
}

export function secondsToHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return `${hh} h ${mm} m ${ss} s`;
}
