import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import AlertError from "@repo/ui/components/AlertError";
import { CollectionLoading } from "@repo/ui/components/fallbacks/CollectionLoading";
import { FormInput } from "@repo/ui/components/form/Form";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { useChangeImageFilters } from "@repo/ui/hooks/useChangeImageFilters";
import { api } from "@repo/ui/lib/api";
import { cn, isSteamGridDbImage } from "@repo/ui/lib/utils";
import { ResponseType } from "@repo/ui/views/collection/ChangeImagesView";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import z from "zod";

import {
  CollectionCard,
  CollectionCardVariant,
} from "@repo/ui/components/collection/CollectionCard";

import {
  CollectionGetById,
  CollectionGetMany,
} from "@repo/schemas/types/collection";

interface Props {
  game: CollectionGetById;
  isPending: boolean;
}

export const GridImages = ({ game, isPending }: Props) => {
  const [page, setPage] = useState(0);

  const { control, watch, formState, setValue } =
    useFormContext<z.infer<typeof updateImagesSchema>>();

  const [filters] = useChangeImageFilters();
  const { cardType, directLink, imageOnly } = filters;

  const externalId = game?.steamGridDBId ?? game?.steamAppId;

  const {
    data: grids,
    isLoading: isLoadingGrid,
    isError,
    error,
  } = useQuery({
    queryKey: ["GRID", game?.id, externalId, page],
    queryFn: async () => {
      const response = await api.get<ResponseType>(`/steamGridDB/getGrids`, {
        params: {
          steamGridDBId: game?.steamGridDBId,
          steamAppId: game?.steamAppId,
          page,
        },
      });

      return response.data;
    },
    enabled: Boolean(externalId),
  });

  const customImage = watch("customImage");

  const previewImage =
    !!customImage &&
    !formState.errors.customImage &&
    isSteamGridDbImage(customImage);

  const CARD_VARIANTS: CollectionCardVariant[] = [
    "compact",
    "overlay",
    "slideUp",
  ];

  const totals = useMemo(() => {
    const totalAmount =
      Number(game.amount) +
      game.dlcs.reduce((acc, dlc) => acc + Number(dlc.amount), 0);

    const totalPlaytime =
      Number(game.totalTime) +
      game.dlcs.reduce((acc, dlc) => acc + Number(dlc.totalTime), 0);

    return { totalAmount, totalPlaytime };
  }, [game]);

  const cardData: CollectionGetMany = {
    ...game,
    listIds: [],
    ...totals,
    customImage: previewImage ? customImage : game.image,
  };

  const totalPages = useMemo(() => {
    if (!grids) return 0;
    return Math.ceil(grids.total / grids.limit);
  }, [grids]);

  // const sortedGrids = useMemo(() => {
  //   if (!grids) return [];

  //   return [...grids.data].sort((a, b) => {
  //     if (a.url === customImage) return -1;
  //     if (b.url === customImage) return 1;
  //     return 0;
  //   });
  // }, [grids, customImage]);

  if (!externalId) {
    return null;
  }

  if (isError) {
    return <AlertError error={error.message} />;
  }

  return (
    <div className="bg-card border-border border-2 rounded-xl p-3">
      {isLoadingGrid && (
        <ScrollArea className="h-140">
          <CollectionLoading />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}

      {!isLoadingGrid && grids && !directLink && (
        <div>
          <ScrollArea className="h-135">
            <div className="flex flex-wrap items-center gap-6 justify-center mt-0.5">
              {grids.data.map((g) => {
                const isSelected = customImage === g.url;

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() =>
                      setValue("customImage", g.url, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    className="bg-transparent p-0 border-none outline-none focus:outline-none text-left block"
                  >
                    <div
                      className={cn(
                        "rounded-xl transition-all duration-200",
                        isSelected
                          ? "ring-2 ring-green-600"
                          : "hover:ring-2 hover:ring-primary/40",
                      )}
                    >
                      {imageOnly ? (
                        <img
                          src={g.url}
                          alt="grid"
                          className="object-cover w-65 h-97.5 rounded-xl"
                        />
                      ) : (
                        <CollectionCard
                          game={{ ...cardData, customImage: g.url }}
                          variant={cardType}
                          showcase
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <ScrollBar orientation="vertical" />
          </ScrollArea>

          <div className="flex items-center gap-2 mt-4 justify-center">
            {Array.from({ length: totalPages }).map((_, i) => {
              return (
                <button
                  key={i + 1}
                  onClick={() => setPage(i)}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm",
                    page === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/70",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isLoadingGrid && (!grids || directLink) && (
        <div className="flex flex-col gap-4">
          <FormInput
            name="customImage"
            control={control}
            disabled={isPending}
            type="text"
            placeholder="Image"
          />

          <div className="flex flex-wrap items-center gap-6 justify-center">
            {CARD_VARIANTS.map((variant) => (
              <CollectionCard
                key={variant}
                game={cardData}
                variant={variant}
                showcase
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
