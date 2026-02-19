import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import { CollectionGetById } from "@repo/schemas/types/collection";
import { HeroSection } from "@repo/ui/components/collection/HeroSection";
import { FormInput } from "@repo/ui/components/form/Form";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useChangeImageFilters } from "@repo/ui/hooks/useChangeImageFilters";
import { api } from "@repo/ui/lib/api";
import { isSteamGridDbImage } from "@repo/ui/lib/utils";
import { ResponseType } from "@repo/ui/views/collection/ChangeImagesView";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import z from "zod";

interface Props {
  game: CollectionGetById;
  isPending: boolean;
}

export const HeroImages = ({ game, isPending }: Props) => {
  const { control, formState, watch } =
    useFormContext<z.infer<typeof updateImagesSchema>>();

  const externalId = game?.steamGridDBId ?? game?.steamAppId;

  const [filters] = useChangeImageFilters();
  const { directLink } = filters;

  const { data: heros, isLoading: isLoadingHero } = useQuery({
    queryKey: ["HERO", game?.id, externalId],
    queryFn: async () => {
      const response = await api.get<Array<ResponseType>>(
        `/steamGridDB/getHeros`,
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

  const customCoverImage = watch("customCoverImage");

  const previewCoverImage =
    !!customCoverImage &&
    !formState.errors.customCoverImage &&
    isSteamGridDbImage(customCoverImage);

  return (
    <div className="bg-card border-border border-2 rounded-xl p-3">
      {isLoadingHero && <Skeleton className="h-[60vh]" />}

      {!isLoadingHero && heros && !directLink && (
        <ScrollArea className="h-140">
          <div className="flex flex-wrap items-center gap-6 justify-center">
            {heros.map((h) => (
              <HeroSection
                key={h.id}
                game={{
                  ...game,
                  customCoverImage: h.url,
                }}
              />
            ))}
          </div>
        </ScrollArea>
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
