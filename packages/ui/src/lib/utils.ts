import type {
  CollectionStatusType,
  PlaythroughStatusType,
} from "@repo/schemas/types/index";
import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isSteamGridDbImage(src?: string | null) {
  if (!src) return false;

  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname === "cdn2.steamgriddb.com";
  } catch {
    return false;
  }
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

export function formatUnlockedTime(date?: Date | string | null) {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;

  return `${format(d, "PP")} • ${formatDistanceToNow(d, {
    addSuffix: true,
  })}`;
}

export const trophyTypeStyles = {
  bronze: {
    border: "border-[#CD7F32]",
    bg: "bg-[#CD7F32]/10",
    text: "text-[#CD7F32]",
  },
  Common: {
    border: "border-[#CD7F32]",
    bg: "bg-[#CD7F32]/10",
    text: "text-[#CD7F32]",
  },

  silver: {
    border: "border-[#C0C0C0]",
    bg: "bg-[#C0C0C0]/10",
    text: "text-[#C0C0C0]",
  },
  Uncommon: {
    border: "border-[#C0C0C0]",
    bg: "bg-[#C0C0C0]/10",
    text: "text-[#C0C0C0]",
  },

  gold: {
    border: "border-[#FFD700]",
    bg: "bg-[#FFD700]/10",
    text: "text-[#FFD700]",
  },
  Rare: {
    border: "border-[#FFD700]",
    bg: "bg-[#FFD700]/10",
    text: "text-[#FFD700]",
  },

  platinum: {
    border: "border-[#0070D1]",
    bg: "bg-[#0070D1]/10",
    text: "text-[#0070D1]",
  },
  "Ultra Rare": {
    border: "border-[#0070D1]",
    bg: "bg-[#0070D1]/10",
    text: "text-[#0070D1]",
  },
} as const;

export function showError(e: Error) {
  if (isAxiosError(e)) {
    toast.error(e.response?.data.error ?? "An error occurred");
  } else {
    toast.error("Something went wrong");
  }
}

// export function normalizeStoreItem(item: PSApiResType["links"][number]) {
//   return {
//     name: item.name,
//     image: item.images.find((i) => i.type === 10)?.url ?? null,
//     coverImage:
//       item.images.find((i) => i.type === 12 || i.type === 13)?.url ?? null,
//   };
// }

// export function isSafeImageSrc(src?: string | null) {
//   if (!src) return false;
//   if (src.startsWith("/")) return true;

//   try {
//     const url = new URL(src);
//     return url.protocol === "http:" || url.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// export const convertDateToSeconds = (date: Date) => {
//   return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
// };
