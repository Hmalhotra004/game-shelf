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

type ScreenMetaResult = Required<ScreenMeta> & {
  /** The stripped route path used for the lookup, e.g. "/[id]/edit". */
  path: string;
  /** The exact segment path this matched on — may be a parent of `path`
   *  when the current screen inherited its meta (e.g. "/[id]"). */
  matchedPath: string;
};

/**
 * ["(collection)","[id]","edit"] -> "/[id]/edit"
 * Unknown child routes inherit the nearest parent entry
 * ("/[id]/foo" -> "/[id]"). Root "/" only matches itself.
 */
const resolveMeta = (segments: string[]): ScreenMetaResult => {
  const parts = segments.filter((s) => !isGroup(s));
  const path = toRoute(parts);

  if (parts.length === 0) {
    const meta = LOOKUP.get("/");
    return { ...DEFAULT_META, ...meta, path: "/", matchedPath: "/" };
  }

  const search = [...parts];
  while (search.length > 0) {
    const matchedPath = toRoute(search);
    const meta = LOOKUP.get(matchedPath);
    if (meta) return { ...DEFAULT_META, ...meta, path, matchedPath };
    search.pop();
  }

  return { ...DEFAULT_META, path, matchedPath: path };
};

export const useScreenMeta = (): ScreenMetaResult => {
  const segments = useSegments() as string[];
  const key = segments.join("/");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => resolveMeta(segments), [key]);
};
