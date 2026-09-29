import { DEFAULT_META, SCREENS } from "@/lib/screens";
import { ScreenMeta } from "@/types";
import { useSegments } from "expo-router";
import { useMemo } from "react";

const isGroup = (s: string) => s.startsWith("(") && s.endsWith(")");

const toRoute = (parts: string[]) => "/" + parts.join("/");

// Normalize keys once so both "/collection" and "/(tabs)/collection"
// style keys (which typed routes may offer) resolve the same way.
const LOOKUP = new Map<string, ScreenMeta>(
  Object.entries(SCREENS).map(([key, meta]) => [
    toRoute(
      key
        .split("/")
        .filter(Boolean)
        .filter((s) => !isGroup(s)),
    ),
    meta as ScreenMeta,
  ]),
);

/**
 * ["(collection)","[id]","edit"] -> "/[id]/edit"
 * Unknown child routes inherit the nearest parent entry
 * ("/[id]/foo" -> "/[id]"). Root "/" only matches itself.
 */
const resolveMeta = (segments: string[]): Required<ScreenMeta> => {
  const parts = segments.filter((s) => !isGroup(s));

  if (parts.length === 0) {
    return { ...DEFAULT_META, ...LOOKUP.get("/") };
  }

  while (parts.length > 0) {
    const meta = LOOKUP.get(toRoute(parts));
    if (meta) return { ...DEFAULT_META, ...meta };
    parts.pop();
  }

  return DEFAULT_META;
};

export const useScreenMeta = (): Required<ScreenMeta> => {
  const segments = useSegments() as string[];
  const key = segments.join("/");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => resolveMeta(segments), [key]);
};
