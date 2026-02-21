import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import { CollectionGetById } from "@repo/schemas/types/collection";
import AlertError from "@repo/ui/components/AlertError";
import { HeroSection } from "@repo/ui/components/collection/HeroSection";
import { FormInput } from "@repo/ui/components/form/Form";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useChangeImageFilters } from "@repo/ui/hooks/useChangeImageFilters";
import { api } from "@repo/ui/lib/api";
import { cn, isSteamGridDbImage } from "@repo/ui/lib/utils";
import { ResponseType } from "@repo/ui/views/collection/ChangeImagesView";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import z from "zod";

interface Props {
  game: CollectionGetById;
  isPending: boolean;
}

export const HeroImages = ({ game, isPending }: Props) => {
  const [page, setPage] = useState(0);

  const { control, formState, watch, setValue } =
    useFormContext<z.infer<typeof updateImagesSchema>>();

  const externalId = game?.steamGridDBId ?? game?.steamAppId;

  const [filters] = useChangeImageFilters();
  const { directLink, imageOnly } = filters;

  const {
    data: heros,
    isLoading: isLoadingHero,
    isError,
    error,
  } = useQuery({
    queryKey: ["HERO", game?.id, externalId, page],
    queryFn: async () => {
      const response = await api.get<ResponseType>(`/steamGridDB/getHeros`, {
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

  const customCoverImage = watch("customCoverImage");

  const previewCoverImage =
    !!customCoverImage &&
    !formState.errors.customCoverImage &&
    isSteamGridDbImage(customCoverImage);

  const totalPages = useMemo(() => {
    if (!heros) return 0;
    return Math.ceil(heros.total / heros.limit);
  }, [heros]);

  if (!externalId) {
    return null;
  }

  if (isError) {
    return <AlertError error={error.message} />;
  }

  return (
    <div className="bg-card border-border border-2 rounded-xl p-3">
      {isLoadingHero && <Skeleton className="h-[60vh]" />}

      {!isLoadingHero && heros && !directLink && (
        <div>
          <ScrollArea className="h-135">
            <div className="flex flex-wrap items-center gap-6 justify-center px-0.5 mt-0.5">
              {heros.data.map((h) => {
                const isSelected = customCoverImage === h.url;

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() =>
                      setValue("customCoverImage", h.url, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    className="block w-full p-0 m-0 bg-transparent border-0 text-left"
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
                          src={h.url}
                          alt="grid"
                          className="rounded-xl h-[60vh] object-cover object-top w-full"
                        />
                      ) : (
                        <HeroSection
                          key={h.id}
                          game={{
                            ...game,
                            customCoverImage: h.url,
                          }}
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

      {!isLoadingHero && (!heros || directLink) && (
        <div className="flex flex-col gap-4">
          <FormInput
            name="customCoverImage"
            control={control}
            disabled={isPending}
            type="text"
            placeholder="Hero Image"
          />

          <HeroSection
            game={{
              ...game,
              customCoverImage: previewCoverImage
                ? customCoverImage
                : game.coverImage,
            }}
          />
        </div>
      )}
    </div>
  );
};
