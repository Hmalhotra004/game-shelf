import { PlaythroughLoading } from "@repo/ui/components/fallbacks/PlaythroughLoading";
import Filters from "@repo/ui/components/playthroughs/Filters";
import { PlaythroughCard } from "@repo/ui/components/playthroughs/PlaythroughCard";
import { usePlaythroughFilters } from "@repo/ui/hooks/usePlaythroughFilters";
import { playthroughGetManyQueryOptions } from "@repo/ui/queries/playthrough/queries";
import { useQuery } from "@tanstack/react-query";

export const PlaythroughView = () => {
  const [filters] = usePlaythroughFilters();

  const { platform, status } = filters;

  const {
    data: playthroughs,
    isLoading,
    isError,
    error,
  } = useQuery(playthroughGetManyQueryOptions());

  const filteredData = playthroughs
    ? playthroughs
        .filter((p) => {
          // Platform filter
          if (platform !== "All" && p.platform !== platform) return false;

          // Status filter
          if (status === "Archived") {
            return p.status === "Archived";
          }

          // For ALL and other statuses, exclude archived
          if (p.status === "Archived") return false;

          // Match selected status
          if (status !== "All" && p.status !== status) return false;

          return true;
        })
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    : [];

  function getStatusText() {
    if (status === "On Hold") return "On Hold";
    if (status === "Archived") return "Archived";
    if (status === "All") return "Playthroughs";
    return "Active";
  }

  return (
    <div className="flex flex-col justify-center gap-6">
      {/* <AddButton
        renderContent={({ open, setOpen }) => (
          <AddPlaythoughModal
            open={open}
            setOpen={setOpen}
          />
        )}
      /> */}

      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Playthroughs</h1>
          <div className="flex gap-x-2 items-center">
            <p className="text-muted-foreground">
              {filteredData.length} {getStatusText()}
            </p>
          </div>
        </div>

        <Filters />
      </div>

      {(isLoading || !playthroughs) && <PlaythroughLoading />}

      {!isLoading &&
        playthroughs &&
        (filteredData.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {filteredData.map((game) => {
              return (
                <PlaythroughCard
                  data={game}
                  key={game.id}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground font-medium">
              No {status} Playthroughs
            </p>
          </div>
        ))}
    </div>
  );
};
