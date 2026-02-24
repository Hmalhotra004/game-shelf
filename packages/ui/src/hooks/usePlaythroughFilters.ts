import { parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  platformValues,
  playthroughStatusFilterValues,
} from "@repo/schemas/enums/index";

export const usePlaythroughFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([...platformValues, "All"]).withDefault(
      "All",
    ),

    status: parseAsStringLiteral(playthroughStatusFilterValues).withDefault(
      "Active",
    ),
  });

  return [filters, setFilters] as const;
};
