import { AddButton } from "@repo/ui/components/AddButton";
import AlertError from "@repo/ui/components/AlertError";
import { PlaythroughLoading } from "@repo/ui/components/fallbacks/PlaythroughLoading";
import AddPlaythoughModal from "@repo/ui/components/playthroughs/AddPlaythoughModal";
import Filters from "@repo/ui/components/playthroughs/Filters";
import { PlaythroughCard2 } from "@repo/ui/components/playthroughs/PlaythroughCard2";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { usePlaythroughFilters } from "@repo/ui/hooks/usePlaythroughFilters";
import { playthroughGetManyQueryOptions } from "@repo/ui/queries/playthrough/queries";
import { getGamesQueryOptions } from "@repo/ui/queries/user/queries";
import { useQuery } from "@tanstack/react-query";

interface Props {
  onFinish: (playthroughId: string) => void;
}

export const PlaythroughView = ({ onFinish }: Props) => {
  const [filters] = usePlaythroughFilters();

  const { platform, status } = filters;

  const {
    data: playthroughs,
    isLoading,
    isError,
    error,
  } = useQuery(playthroughGetManyQueryOptions());

  const { data: games, isLoading: isGamesLoading } = useQuery(
    getGamesQueryOptions(),
  );

  const filteredData = playthroughs
    ? playthroughs
        .filter((p) => {
          if (platform !== "All" && p.platform !== platform) return false;

          if (status === "Archived") {
            return p.status === "Archived";
          }

          if (p.status === "Archived") return false;

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

  if (isError) {
    return <AlertError error={error.message} />;
  }

  return (
    <div className="flex flex-col justify-center gap-4">
      {!isGamesLoading && games && (
        <AddButton
          renderContent={({ open, setOpen }) => (
            <AddPlaythoughModal
              open={open}
              setOpen={setOpen}
              data={games}
            />
          )}
        />
      )}

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
          <ScrollArea className="h-145">
            <div className="flex flex-wrap gap-4">
              {filteredData.map((game) => {
                return (
                  <PlaythroughCard2
                    data={game}
                    key={game.id}
                    onFinish={onFinish}
                  />
                );
              })}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
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
