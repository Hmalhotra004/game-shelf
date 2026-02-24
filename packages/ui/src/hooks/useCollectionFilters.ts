import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  CollectionStatusValues,
  PlatformValues,
} from "@repo/schemas/enums/index";

export const useCollectionFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([
      "All",
      ...PlatformValues,
    ] as const).withDefault("All"),

    status: parseAsStringLiteral([
      "All",
      ...CollectionStatusValues,
    ] as const).withDefault("All"),

    view: parseAsStringLiteral(["TABLE", "GRID"] as const).withDefault("GRID"),

    list: parseAsString.withDefault("All"),

    search: parseAsString.withDefault(""),
  });

  return [filters, setFilters] as const;
};
