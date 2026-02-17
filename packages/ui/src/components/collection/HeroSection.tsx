import { CollectionGetById } from "@repo/schemas/types/collection";
import { Badge } from "@repo/ui/components/ui/badge";
import { betterTimeText } from "@repo/ui/lib/utils";
import { format } from "date-fns";

import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  IndianRupeeIcon,
} from "lucide-react";

interface Props {
  game: CollectionGetById;
}

const HeroSection = ({ game }: Props) => {
  const editonText = game.edition ? ` - ${game.edition}` : null;

  return (
    <div className="relative rounded-xl overflow-hidden h-[60vh]">
      <img
        src={game.customCoverImage ?? game.coverImage!}
        alt={game.name}
        className="object-cover object-top"
      />

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

      <div className="flex flex-col justify-between absolute bottom-0 left-0 right-0 p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{game.platform}</Badge>
            <Badge variant="secondary">{game.provider}</Badge>
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            {game.name} {editonText}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ClockIcon className="size-4 text-primary" />
              {game.status === "Online"
                ? betterTimeText(game.onlinePlaySecs, true)
                : betterTimeText(Number(game.totalTime), true)}
            </span>

            <span className="flex items-center gap-1">
              <IndianRupeeIcon className="size-4 text-chart-2" />
              {game.amount}
            </span>

            <span className="flex items-center gap-1">
              <CalendarIcon className="size-4 text-primary" />
              {format(game.dateOfPurchase, "PP")}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckIcon className="size-4 text-primary" />
              {game.completions}
            </span>

            <span className="flex items-center gap-1">
              <DownloadIcon className="size-4 text-primary" />
              {game.dlcCount}
            </span>
          </div>

          <div className="flex items-center gap-x-2">
            <span className="flex items-center gap-1">
              <Badge variant="custom">{game.status}</Badge>
            </span>

            <span className="flex items-center gap-1">
              <Badge variant="custom">{game.ownershipType}</Badge>
            </span>
          </div>

          {game.lists.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <h1 className="text-sm text-muted-foreground">Lists</h1>
              <div className="flex gap-2 items-center">
                {game.lists.map((l) => {
                  return (
                    <Badge
                      key={l.id}
                      variant="custom"
                    >
                      {l.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
