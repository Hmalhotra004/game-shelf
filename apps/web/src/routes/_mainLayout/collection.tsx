import { Activity, useEffect, useRef } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { CollectionCard } from "@repo/ui/components/collection/CollectionCard";
import Filters from "@repo/ui/components/collection/Filters";
import { CollectionEmptyState } from "@repo/ui/components/emptyStates/CollectionEmptyState";
import { useCollectionFilters } from "@repo/ui/hooks/useCollectionFilters";
import { api } from "@repo/ui/lib/api";
import { useCardVariantStore } from "@repo/ui/store/useCardVariantStore";

import type { CollectionGetManyResponse } from "@repo/schemas/types/collection";

export const Route = createFileRoute("/_mainLayout/collection")({
  component: App,
});

function App() {
  const [filters] = useCollectionFilters();
  const variant = useCardVariantStore((s) => s.variant);

  const { platform, view, search, status } = filters;

  const limit = 10;

  async function fetchCollections({
    pageParam = 1,
    limit,
  }: {
    pageParam?: number;
    limit: number;
  }) {
    const res = await api.get<CollectionGetManyResponse>(
      `/collection/getMany?page=${pageParam}&limit=${limit}`,
    );

    return res.data;
  }

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["collections", limit],
      queryFn: ({ pageParam }) => fetchCollections({ pageParam, limit }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.items.length < limit) return undefined;
        return allPages.length + 1;
      },
    });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading || !data) return <div>Loading…</div>;

  const games = data.pages.flatMap((p) => p.items);

  const filteredGames = games
    .filter(
      (g) =>
        search.trim() === "" ||
        g.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((g) => status === "All" || g.status === status)
    .filter((g) => platform === "All" || g.platform === platform);
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

          {/* loader */}
          <div
            ref={loadMoreRef}
            className="h-1"
          />

          {isFetchingNextPage && (
            <div className="text-center text-sm text-muted-foreground">
              Loading more…
            </div>
          )}
        </div>
      </Activity>

      <Activity
        name="TABLE"
        mode={isGrid ? "hidden" : "visible"}
      >
        <div>T</div>
      </Activity>
    </div>
  );
}
