import { UnlinkAccountSchemaType } from "@repo/schemas/schemas/user";
import { PlatformAccountType } from "@repo/schemas/types/index";

export const TYPE_MAP: Record<
  PlatformAccountType,
  UnlinkAccountSchemaType["type"]
> = {
  steam: "Steam",
  playstation: "PSN",
  epic: "Epic",
  xbox: "XBOX",
};

export const ACCENT: Record<PlatformAccountType, string> = {
  steam: "#1b9bd7",
  playstation: "#0070d1",
  epic: "#9ca3af",
  xbox: "#107c10",
};
