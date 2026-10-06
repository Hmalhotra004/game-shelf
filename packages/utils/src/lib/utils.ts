import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  CollectionStatusType,
  PlaythroughStatusType,
} from "@repo/schemas/types/index";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export const statusColorMap: Record<
  CollectionStatusType,
  { bg: string; border: string }
> = {
  Dropped: { bg: "bg-red-500/15", border: "border-red-500" },
  Backlog: { bg: "bg-yellow-500/15", border: "border-yellow-500" },
  Online: { bg: "bg-blue-600/15", border: "border-blue-600" },
  "On Hold": { bg: "bg-orange-600/15", border: "border-orange-600" },
  Playing: { bg: "bg-green-600/15", border: "border-green-600" },
  "Story Completed": { bg: "bg-blue-600/15", border: "border-blue-600" },
  Platinum: { bg: "bg-purple-600/15", border: "border-purple-600" },
  "Platinum+": { bg: "bg-purple-700/15", border: "border-purple-700" },
  "100% Completed": { bg: "bg-emerald-600/15", border: "border-emerald-600" },
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
