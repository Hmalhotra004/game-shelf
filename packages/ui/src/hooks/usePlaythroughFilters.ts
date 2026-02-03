import { platform, playthroughStatus } from "@repo/schemas/db/front";
import { parseAsStringLiteral, useQueryStates } from "nuqs";

export const usePlaythroughFilters = () => {
  const [filters, setFilters] = useQueryStates({
    platform: parseAsStringLiteral([...platform.enumValues, "All"]).withDefault(
      "All",
    ),
    status: parseAsStringLiteral([
      ...playthroughStatus.enumValues,
      "All",
    ]).withDefault("Active"),
  });

  return [filters, setFilters] as const;
};
