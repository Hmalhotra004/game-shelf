import { ScreenMeta } from "@/types";
import type { Href } from "expo-router";

// Every absolute route pattern from typed routes, e.g. "/", "/collection",
// "/[id]/edit". Pulled from the object form of Href, which carries the
// route templates (dynamic segments are not replaced with values).
export type AppRoute = Extract<
  Extract<Href, { pathname: string }>["pathname"],
  `/${string}`
>;

// Partial: only routes that need custom meta get an entry.
// Typos and non-existent routes become compile errors, and keys autocomplete.
export const SCREENS: Partial<Record<AppRoute, ScreenMeta>> = {
  // (tabs)
  "/": { title: "Home" },
  "/collection": { title: "Collection" },
  "/playthrough": { title: "Playthrough" },
  "/completion": { title: "Completion" },

  // (profile)
  // "/settings": { title: "Settings", showAvatar: false },
  // "/lists": { title: "Lists" },

  // (collection)/[id]
  // "/[id]": { title: "Game", showHeader: false },
  // "/[id]/edit": { title: "Edit Game", showAvatar: false },
  // "/[id]/edit-images": { title: "Edit Images", showAvatar: false },
  // "/[id]/manage-dlcs": { title: "Manage DLCs", showAvatar: false },
  // "/[id]/manage-micro": {
  //   title: "Manage Microtransactions",
  //   showAvatar: false,
  // },
};

export const DEFAULT_META: Required<ScreenMeta> = {
  title: "Game Shelf",
  showHeader: true,
  showAvatar: true,
};
