import { platform, status } from "@repo/schemas/db/schema";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export const useCollectionFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([
      "All",
      ...platform.enumValues,
    ] as const).withDefault("All"),
    status: parseAsStringLiteral([
      ...status.enumValues,
      "All",
    ] as const).withDefault("All"),
    view: parseAsStringLiteral(["TABLE", "GRID"] as const).withDefault("GRID"),
    list: parseAsString.withDefault("All"),
    search: parseAsString.withDefault(""),
  });

  return [filters, setFilters] as const;
};
