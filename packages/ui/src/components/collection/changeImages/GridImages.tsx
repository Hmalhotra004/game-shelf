import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import { CollectionLoading } from "@repo/ui/components/fallbacks/CollectionLoading";
import { FormInput } from "@repo/ui/components/form/Form";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { useChangeImageFilters } from "@repo/ui/hooks/useChangeImageFilters";
import { api } from "@repo/ui/lib/api";
import { cn, isSteamGridDbImage } from "@repo/ui/lib/utils";
import { ResponseType } from "@repo/ui/views/collection/ChangeImagesView";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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
  const { control, watch, formState, setValue } =
    useFormContext<z.infer<typeof updateImagesSchema>>();

  const [filters] = useChangeImageFilters();
  const { cardType, directLink } = filters;

  const externalId = game?.steamGridDBId ?? game?.steamAppId;

  const { data: grids, isLoading: isLoadingGrid } = useQuery({
    queryKey: ["GRID", game?.id, externalId],
    queryFn: async () => {
      const response = await api.get<Array<ResponseType>>(
        `/steamGridDB/getGrids`,
        {
          params: {
            steamGridDBId: game?.steamGridDBId,
            steamAppId: game?.steamAppId,
          },
        },
      );

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

  const sortedGrids = useMemo(() => {
    if (!grids) return [];

    return [...grids].sort((a, b) => {
      if (a.url === customImage) return -1;
      if (b.url === customImage) return 1;
      return 0;
    });
  }, [grids, customImage]);

  if (!externalId) {
    return null;
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
        <ScrollArea className="h-140">
          <div className="flex flex-wrap items-center gap-6 justify-center">
            {grids.map((g) => {
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
                  className={cn(
                    "rounded-xl overflow-hidden transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-green-700 border-2"
                      : "border-border hover:border-primary/40 border-2",
                  )}
                >
                  <CollectionCard
                    game={{ ...cardData, customImage: g.url }}
                    variant={cardType}
                    showcase
                  />
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
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
