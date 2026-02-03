import { completionStyle, platform } from "@repo/schemas/db/schema";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export const useCompletionFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([
      "All",
      ...platform.enumValues,
    ] as const).withDefault("All"),
    style: parseAsStringLiteral([
      "All",
      ...completionStyle.enumValues,
    ] as const).withDefault("All"),
    search: parseAsString.withDefault(""),
  });

  return [filters, setFilters] as const;
};
