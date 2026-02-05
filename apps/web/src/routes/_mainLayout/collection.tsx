import { Activity } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { CollectionCard } from "@repo/ui/components/collection/CollectionCard";
import Filters from "@repo/ui/components/collection/Filters";
import { CollectionEmptyState } from "@repo/ui/components/emptyStates/CollectionEmptyState";
import { CollectionLoading } from "@repo/ui/components/fallbacks/CollectionLoading";
import { useCollectionFilters } from "@repo/ui/hooks/useCollectionFilters";
import { collectionGetManyQueryOptions } from "@repo/ui/queries/collection.queries";
import { useCardVariantStore } from "@repo/ui/store/useCardVariantStore";

export const Route = createFileRoute("/_mainLayout/collection")({
  // loader: async ({ context }) => {
  //   await context.queryClient.ensureQueryData(collectionGetManyQueryOptions());
  // },
  component: App,
});

function App() {
  const [filters] = useCollectionFilters();
  const variant = useCardVariantStore((s) => s.variant);

  const { platform, view, search, status } = filters;

  const { data: games, isLoading } = useQuery(collectionGetManyQueryOptions());

  const filteredGames = games
    ? games
        .filter(
          (g) =>
            search.trim() === "" ||
            g.name.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((g) => status === "All" || g.status === status)
        .filter((g) => platform === "All" || g.platform === platform)
    : [];
  // .filter((g) => list === "All" || g.lists.includes(list));

  const totalAmount = filteredGames.reduce((sum, g) => sum + g.totalAmount, 0);

  const isGrid = view === "GRID";

  return (
    <div className="flex flex-col justify-center gap-6 pb-4">
      {/* <AddButton
        renderContent={({ open, setOpen }) => (
          <Dialog></Dialog>
          // <AddCommand
          //   open={open}
          //   setOpen={setOpen}
          // />
        )}
      /> */}

      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Game Collection</h1>
          <div className="flex gap-x-2 items-center">
            <p className="text-muted-foreground">
              {filteredGames.length} game{filteredGames.length === 1 ? "" : "s"}
            </p>
            <p className="text-muted-foreground">
              Total Amount: {totalAmount} Rs.
            </p>
          </div>
        </div>

        <Filters />
      </div>

      {isLoading || !games ? (
        <CollectionLoading />
      ) : (
        <>
          {games.length === 0 && <CollectionEmptyState Link={Link} />}

          <Activity
            name="GRID"
            mode={isGrid ? "visible" : "hidden"}
          >
            <div className="flex flex-col">
              <div className="group/grid grid grid-cols-[repeat(auto-fill,265px)] gap-6 justify-center mb-4">
                {filteredGames.map((g) => {
                  return (
                    <CollectionCard
                      key={g.id}
                      game={g}
                      Link={Link}
                      variant={variant}
                    />
                  );
                })}
              </div>
            </div>
          </Activity>

          <Activity
            name="TABLE"
            mode={isGrid ? "hidden" : "visible"}
          >
            <div>T</div>
          </Activity>
        </>
      )}
    </div>
  );
}
