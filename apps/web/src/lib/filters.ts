import { useCollectionFilters } from "@/hooks/useCollectionFilters";
import { CollectionGetMany } from "@repo/schemas/types/collection";

export function filterCollection(
  data: CollectionGetMany[],
  filters: ReturnType<typeof useCollectionFilters>[0],
) {
  const { list, platform, search, status } = filters;

  return data
    .filter(
      (g) =>
        search.trim() === "" ||
        g.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((g) => status === "All" || g.status === status)
    .filter((g) => platform === "All" || g.platform === platform)
    .filter((g) => list === "All" || g.listIds.includes(list));
}
