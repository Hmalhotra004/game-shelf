import { CollectionGetMany } from "@repo/schemas/types/collection";
import { CollectionCard } from "@repo/ui/components/collection/CollectionCard";
import Filters from "@repo/ui/components/collection/Filters";
import { CollectionEmptyState } from "@repo/ui/components/emptyStates/CollectionEmptyState";
import { CollectionLoading } from "@repo/ui/components/fallbacks/CollectionLoading";
import { useCollectionFilters } from "@repo/ui/hooks/useCollectionFilters";
import { collectionGetManyQueryOptions } from "@repo/ui/queries/collection/collection.queries";
import { useCardVariantStore } from "@repo/ui/store/useCardVariantStore";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "react";

interface Props {
  renderLink?: (
    children: React.ReactNode,
    game: CollectionGetMany,
  ) => React.ReactNode;
  renderImportLink?: (children: React.ReactNode) => React.ReactNode;
  renderContextMenuActions?: {
    onEdit?: (game: CollectionGetMany) => void;
    onChangeImages?: (game: CollectionGetMany) => void;
  };
}

export const CollectionView = ({
  renderLink,
  renderImportLink,
  renderContextMenuActions,
}: Props) => {
  const [filters] = useCollectionFilters();
  const variant = useCardVariantStore((s) => s.variant);

  const { platform, view, search, status, list } = filters;

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
        .filter((g) => list === "All" || g.listIds.includes(list))
    : [];

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
          {games.length === 0 && (
            <CollectionEmptyState renderLink={renderImportLink} />
          )}

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
                      renderLink={renderLink}
                      variant={variant}
                      renderContextMenuActions={renderContextMenuActions}
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
};
