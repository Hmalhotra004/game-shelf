import { platformValues, statusValues } from "@repo/schemas/enums/index";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export const useCollectionFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([
      "All",
      ...platformValues,
    ] as const).withDefault("All"),

    status: parseAsStringLiteral(["All", ...statusValues] as const).withDefault(
      "All",
    ),

    view: parseAsStringLiteral(["TABLE", "GRID"] as const).withDefault("GRID"),

    list: parseAsString.withDefault("All"),

    search: parseAsString.withDefault(""),
  });

  return [filters, setFilters] as const;
};
