import { CollectionGetMany } from "@repo/schemas/types/collection";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import CollectionPageSuspense from "@/components/collection/CollectionPageSuspense";
import Filters from "@/components/collection/Filters";
import { CollectionLoading } from "@/components/fallbacks/CollectionLoading";
import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCollectionFilters } from "@/hooks/useCollectionFilters";
import { api } from "@/lib/api";
import { filterCollection } from "@/lib/filters";

import {
  collectionGetManyQueryOptions,
  CollectionQueryKeys,
} from "@repo/utils/queries/collection";

export const Route = createFileRoute("/_mainLayout/collection/")({
  loader: async ({ context }) => {
    const { queryClient } = context;

    await queryClient.prefetchQuery(collectionGetManyQueryOptions(api));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  const games = queryClient.getQueryData<Array<CollectionGetMany>>(
    CollectionQueryKeys.getMany(),
  );

  const [filters] = useCollectionFilters();

  const filteredGames = filterCollection(games ?? [], filters);

  const totalAmount = filteredGames.reduce((sum, g) => sum + g.totalAmount, 0);

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
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<CollectionLoading />}>
              <ErrorBoundaryWrapper>
                <CollectionPageSuspense />
              </ErrorBoundaryWrapper>
            </Suspense>
          </HydrationBoundary>

          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
