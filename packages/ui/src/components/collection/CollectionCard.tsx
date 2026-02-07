"use client";

import { CollectionGetMany } from "@repo/schemas/types/collection";
import { LinkType } from "@repo/schemas/types/index";
import { Badge } from "@repo/ui/components/ui/badge";
import { betterTimeText, cn, statusColorMap } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { format } from "date-fns";

import {
  CalendarIcon,
  CheckIcon,
  DownloadIcon,
  IndianRupeeIcon,
  PlayIcon,
} from "lucide-react";

export type CollectionCardVariant = "compact" | "overlay" | "slideUp";

const cardVariants = cva(
  "relative rounded-xl overflow-hidden bg-card transition border",
  {
    variants: {
      variant: {
        compact:
          "w-65 flex flex-col shadow-sm hover:shadow-md hover:border-primary",
        overlay: "w-65 h-97.5 shadow-lg group-hover:scale-[1.02]",
        slideUp: "w-65 h-97.5 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "compact",
    },
  },
);

interface Props extends VariantProps<typeof cardVariants> {
  Link: LinkType;
  game: CollectionGetMany;
  showcase?: boolean;
}

export const CollectionCard = ({
  game,
  variant,
  showcase = false,
  Link,
}: Props) => {
  const getPlayTime = () => {
    if (game.status === "Online") return betterTimeText(game.onlinePlaySecs);

    if (game.totalPlaytime > 0) return betterTimeText(game.totalPlaytime);

    return "0h 0m";
  };

  const playTime = getPlayTime();

  const content = (
    <div className={cardVariants({ variant })}>
      <Badge
        variant="custom"
        className="absolute top-2 left-2 z-40"
      >
        {game.platform}
      </Badge>

      <img
        src={game.customImage ?? game.image!}
        alt={game.name}
        className={cn(
          "object-cover relative overflow-hidden",
          variant === "compact" ? "h-64" : "h-full",
          variant === "compact" && "object-top",
        )}
      />

      {variant === "compact" && (
        <CompactContent
          game={game}
          playTime={playTime}
        />
      )}

      {variant === "overlay" && (
        <OverlayContent
          game={game}
          playTime={playTime}
        />
      )}

      {variant === "slideUp" && (
        <SlideUpContent
          game={game}
          playTime={playTime}
        />
      )}
    </div>
  );

  if (showcase) {
    return <div className="group">{content}</div>;
  }

  return (
    // <CardContextMenu data={game}>
    <Link
      to={`/collection/${game.id}?provider=${game.provider}`}
      className={cn(
        "group focus:outline-none",
        variant !== "compact" && "relative",
      )}
    >
      {content}
    </Link>
    // </CardContextMenu>
  );
};

function CompactContent({
  game,
  playTime,
}: Readonly<{ game: CollectionGetMany; playTime: string }>) {
  return (
    <div className="flex flex-col p-3 gap-2 flex-1">
      <Title name={game.name} />

      <MetaRow
        game={game}
        playTime={playTime}
      />

      <Footer game={game} />
    </div>
  );
}

function OverlayContent({
  game,
  playTime,
}: Readonly<{ game: CollectionGetMany; playTime: string }>) {
  return (
    <>
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
        <Title name={game.name} />

        <MetaRow
          game={game}
          playTime={playTime}
        />

        <Footer game={game} />
      </div>
    </>
  );
}

function SlideUpContent({
  game,
  playTime,
}: Readonly<{ game: CollectionGetMany; playTime: string }>) {
  return (
    <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-card p-3 flex flex-col gap-2">
      <Title name={game.name} />

      <MetaRow
        game={game}
        playTime={playTime}
      />

      <Footer game={game} />
    </div>
  );
}

function Title({ name }: Readonly<{ name: string }>) {
  return (
    <h1 className="text-base font-semibold leading-tight line-clamp-2">
      {name}
    </h1>
  );
}

function MetaRow({
  game,
  playTime,
}: Readonly<{ game: CollectionGetMany; playTime: string }>) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
      <span className="flex items-center gap-1">
        <PlayIcon className="size-4" />
        {playTime}
      </span>

      {game.dateOfPurchase && (
        <span className="flex items-center gap-1">
          <CalendarIcon className="size-4" />
          {format(game.dateOfPurchase, "PP")}
        </span>
      )}

      {game.totalAmount !== null && (
        <span className="flex items-center gap-1">
          {game.totalAmount === 0 ? (
            "Free"
          ) : (
            <IndianRupeeIcon className="size-4" />
          )}
          {game.totalAmount || ""}
        </span>
      )}
    </div>
  );
}

function Footer({ game }: Readonly<{ game: CollectionGetMany }>) {
  return (
    <div className="flex items-center justify-between mt-auto">
      <Badge
        variant="custom"
        className={cn(statusColorMap[game.status])}
      >
        {game.status}
      </Badge>

      {game.dlcCount > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <DownloadIcon className="size-4" />
          {game.dlcCount}
        </span>
      )}

      {game.completions > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckIcon className="size-4" />
          {game.completions}
        </span>
      )}
    </div>
  );
}
