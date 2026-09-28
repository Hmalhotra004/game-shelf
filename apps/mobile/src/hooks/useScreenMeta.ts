import { DEFAULT_META, SCREENS, ScreenKey } from "@/lib/screens";
import { ScreenMeta } from "@/types";
import { useSegments } from "expo-router";
import { useMemo } from "react";

const isScreenKey = (value: string): value is ScreenKey =>
  Object.prototype.hasOwnProperty.call(SCREENS, value);

/**
 * Exact match first, then walks up to the nearest parent entry.
 *  ["(collection)","[id]","edit"] -> "(collection)/[id]/edit"
 *  ["(collection)","[id]","foo"]  -> falls back to "(collection)/[id]"
 */
const resolveMeta = (segments: string[]): Required<ScreenMeta> => {
  const parts = [...segments];

  while (parts.length > 0) {
    const key = parts.join("/");
    if (isScreenKey(key)) return { ...DEFAULT_META, ...SCREENS[key] };
    parts.pop();
  }

  return DEFAULT_META;
};

export const useScreenMeta = (): Required<ScreenMeta> => {
  const segments = useSegments() as string[];
  const key = segments.join("/");

  // segments is a new array each render, so memoize on the joined string
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => resolveMeta(segments), [key]);
};
