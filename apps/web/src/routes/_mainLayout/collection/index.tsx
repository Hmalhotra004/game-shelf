import { CollectionCard } from "@/components/collection/CollectionCard";
import Filters from "@/components/collection/Filters";
import { CollectionEmptyState } from "@/components/emptyStates/CollectionEmptyState";
import { CollectionLoading } from "@/components/fallbacks/CollectionLoading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCollectionFilters } from "@/hooks/useCollectionFilters";
import { api } from "@/lib/api";
import { useCardVariantStore } from "@/store/useCardVariantStore";
import { collectionGetManyQueryOptions } from "@repo/utils/queries/collection";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
// import { Activity } from "react";

export const Route = createFileRoute("/_mainLayout/collection/")({
  loader: async ({ context }) => {
    const { queryClient } = context;

    await queryClient.ensureQueryData(collectionGetManyQueryOptions(api));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [filters] = useCollectionFilters();
  const variant = useCardVariantStore((s) => s.variant);

  const { platform, view, search, status, list } = filters;

  const { data: games, isLoading } = useQuery(
    collectionGetManyQueryOptions(api),
  );

  const filteredGames = games
    ? games
        .filter(
          (g) =>
            search.trim() === "" ||
            g.name.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((g) => status === "All" || g.status === status)
        .filter((g) => platform === "All" || g.platform === platform)
        .filter((g) => list === "All" || g.listIds.includes(list))
    : [];

  const totalAmount = filteredGames.reduce((sum, g) => sum + g.totalAmount, 0);

  const isGrid = view === "GRID";

  return (
    <div className="flex flex-col gap-6 pb-4 min-h-0 h-full">
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

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          {isLoading || !games ? (
            <CollectionLoading />
          ) : (
            <>
              {games.length === 0 && <CollectionEmptyState />}

              {/* <Activity
            name="GRID"
            mode={isGrid ? "visible" : "hidden"}
          > */}
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
              {/* </Activity> */}

              {/* <Activity
            name="TABLE"
            mode={isGrid ? "hidden" : "visible"}
          >
            <div>T</div>
          </Activity> */}
            </>
          )}

          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
