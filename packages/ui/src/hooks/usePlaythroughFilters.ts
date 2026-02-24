import { parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  PlatformValues,
  PlaythroughStatusValues,
} from "@repo/schemas/enums/index";

export const usePlaythroughFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([...PlatformValues, "All"]).withDefault(
      "All",
    ),

    status: parseAsStringLiteral([
      ...PlaythroughStatusValues,
      "All",
    ]).withDefault("Active"),
  });

  return [filters, setFilters] as const;
};
