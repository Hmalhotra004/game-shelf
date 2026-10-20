export const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");

const EDITION_SUFFIX =
  /[\s:–—-]+(?:(?:the|ultimate|deluxe|definitive|complete|standard|gold|premium|special|collector'?s|anniversary|enhanced|legendary|digital|launch|royal|platinum|limited|game of the year|goty|day one)\s+)+edition\s*$/i;

// "Control: Ultimate Edition" -> "Control"
export function stripEdition(name: string, edition?: string | null) {
  let out = name.trim();

  if (edition) {
    const escaped = edition.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`[\\s:–—-]+${escaped}\\s*$`, "i"), "");
  }

  return out.replace(EDITION_SUFFIX, "").trim();
}
