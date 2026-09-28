import { ScreenMeta } from "@/types";

// Keys mirror your app/ folder structure (groups and [params] included).
export const SCREENS = {
  // (tabs)
  "(tabs)": { title: "Home" }, // (tabs)/index
  "(tabs)/collection": { title: "Collection" },
  "(tabs)/playthrough": { title: "Playthrough" },
  "(tabs)/completion": { title: "Completion" },

  // (profile)
  "(profile)/settings": { title: "Settings", showAvatar: false },
  "(profile)/lists": { title: "Lists" },

  // (collection)/[id]
  "(collection)/[id]": { title: "Game", showHeader: false },
  "(collection)/[id]/edit": { title: "Edit Game", showAvatar: false },
  "(collection)/[id]/edit-images": { title: "Edit Images", showAvatar: false },
  "(collection)/[id]/manage-dlcs": { title: "Manage DLCs", showAvatar: false },
  "(collection)/[id]/manage-micro": {
    title: "Manage Microtransactions",
    showAvatar: false,
  },
} as const satisfies Record<string, ScreenMeta>;

export type ScreenKey = keyof typeof SCREENS;

export const DEFAULT_META: Required<ScreenMeta> = {
  title: "Game Shelf",
  showHeader: true,
  showAvatar: true,
};
