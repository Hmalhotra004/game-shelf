import {
  CollectionStatusType,
  CompletionStyleType,
  PlaythroughStatusType,
  ProviderType,
} from "@repo/schemas/types/index";

export const providerChartColorMap: Record<ProviderType, string> = {
  PSN: "#1447e6",
  // Steam: "#171d25",
  Steam: "oklch(27.9% 0.041 260.031)",
  Epic: "#000000",
  Physical: "#d97706",
};

export const playthroughStatusChartColorMap: Record<
  PlaythroughStatusType,
  string
> = {
  Active: "#16a34a", // green-600
  "On Hold": "#eab308", // yellow-500
  Archived: "#6b7280", // gray-500
};

export const statusChartColorMap: Record<CollectionStatusType, string> = {
  Backlog: "#64748b", // slate-500
  Playing: "#16a34a",
  "On Hold": "#eab308",
  Dropped: "#dc2626",
  Online: "#2b7fff",

  "Story Completed": "#2563eb",

  Platinum: "#7c3aed",
  "Platinum+": "#c026d3",

  "100% Completed": "oklch(37.8% 0.077 168.94)",
};

export const completionStyleChartColorMap: Record<CompletionStyleType, string> =
  {
    "Speed Run": "#f97316",
    Story: "#3b82f6",
    "Story + Some Extras": "#06b6d4",
    "Story + Lots of Extras": "#0d9488",

    Completionated: "#059669",

    "NG+ Run": "#4f46e5",
    "Challenge Run": "#b91c1c",
    "Achievement Run": "#7c3aed",
  };
