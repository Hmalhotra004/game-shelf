import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  CompletionStyleValues,
  PlatformValues,
} from "@repo/schemas/enums/index";

export const useCompletionFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([
      "All",
      ...PlatformValues,
    ] as const).withDefault("All"),

    style: parseAsStringLiteral([
      "All",
      ...CompletionStyleValues,
    ] as const).withDefault("All"),

    search: parseAsString.withDefault(""),
  });

  return [filters, setFilters] as const;
};
