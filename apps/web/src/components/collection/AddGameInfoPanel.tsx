import { format } from "date-fns";
import { Gamepad2Icon } from "lucide-react";

import type { GetById } from "@repo/schemas/types/igdb";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
  game: GetById;
}

const AddGameInfoPanel = ({ game }: Props) => {
  return (
    <div className="flex flex-col">
      <div className="relative w-full h-full rounded-lg bg-muted shadow-md overflow-hidden">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover block object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2Icon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/85 flex items-end p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold leading-tight">
                {game?.name}
              </h2>

              {game.releaseDate && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(game.releaseDate, "PPP")}
                </p>
              )}
            </div>

            {game?.genres?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">
                  Genres
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {game.genres.map((g) => (
                    <Badge
                      key={g.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {g.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {game?.platforms?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">
                  Available on
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms.map((p) => (
                    <Badge
                      key={p.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {p.abbreviation ?? p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {game?.summary && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
                  {game.summary}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGameInfoPanel;
