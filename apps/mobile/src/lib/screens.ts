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
  "/": { title: "Home", showBack: false },
  "/collection": { title: "Collection", showBack: false },
  "/playthrough": { title: "Playthroughs", showBack: false },
  "/completion": { title: "Completions", showBack: false },

  // (profile)
  "/profile": { title: "Profile", showAvatar: false },
  // "/settings": { title: "Settings", showAvatar: false },
  // "/lists": { title: "Lists" },

  // (collection)
  "/add": { title: "Add Collection", showHeader: false },

  // (collection)/[id]
  "/[collectionId]/index": { title: "Game", showHeader: false },
  "/[collectionId]/edit": { title: "Edit Game", showAvatar: false },
  "/(collection)/[collectionId]/edit-images": {
    title: "Edit Images",
    showAvatar: false,
  },
  "/(collection)/[collectionId]/manage-dlcs": {
    title: "Manage DLCs",
    showAvatar: false,
  },
  "/(collection)/[collectionId]/manage-micro": {
    title: "Manage Microtransactions",
    showAvatar: false,
  },
};

export const DEFAULT_META: Required<ScreenMeta> = {
  title: "Game Shelf",
  showHeader: true,
  showAvatar: true,
  showBack: true,
};
