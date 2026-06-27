import { collectionGetManyQueryOptions } from "@repo/utils/queries/collection";
import { useSuspenseQuery } from "@tanstack/react-query";

import { CollectionCard } from "@/components/collection/CollectionCard";
import { CollectionEmptyState } from "@/components/emptyStates/CollectionEmptyState";
import { useCollectionFilters } from "@/hooks/useCollectionFilters";
import { api } from "@/lib/api";
import { filterCollection } from "@/lib/filters";
import { useCardVariantStore } from "@/store/useCardVariantStore";

const CollectionPageSuspense = () => {
  const { data: games } = useSuspenseQuery(collectionGetManyQueryOptions(api));

  const variant = useCardVariantStore((s) => s.variant);

  const [filters] = useCollectionFilters();
  const isTable = filters.view === "TABLE";

  const filteredGames = filterCollection(games, filters);

  if (games.length === 0) {
    return <CollectionEmptyState />;
  }

  if (isTable) {
    return <div>T</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-2.5 gap-y-6">
        {filteredGames.map((g) => {
          return (
            <div
              key={g.id}
              className="mx-auto"
            >
              <CollectionCard
                game={g}
                variant={variant}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionPageSuspense;
