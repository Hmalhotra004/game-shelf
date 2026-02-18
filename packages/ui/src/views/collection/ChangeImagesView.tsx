import { zodResolver } from "@hookform/resolvers/zod";
import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { Filters } from "@repo/ui/components/collection/changeImages/Filters";
import { InstructionsModal } from "@repo/ui/components/collection/changeImages/InstructionsModal";
import { LinkGameModal } from "@repo/ui/components/collection/changeImages/LinkGameModal";
import { HeroSection } from "@repo/ui/components/collection/HeroSection";
import { CollectionLoading } from "@repo/ui/components/fallbacks/CollectionLoading";
import { FormInput } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { useChangeImageFilters } from "@repo/ui/hooks/useChangeImageFilters";
import { api } from "@repo/ui/lib/api";
import { showError } from "@repo/ui/lib/utils";
import { CollectionQueryKeys } from "@repo/ui/queries/collection/collection.keys";
import { collectionGetByIdQueryOptions } from "@repo/ui/queries/collection/collection.queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  CollectionCard,
  CollectionCardVariant,
} from "@repo/ui/components/collection/CollectionCard";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";

interface Props {
  collectionId: string;
}

function isSteamGridDbImage(src?: string | null) {
  if (!src) return false;

  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname === "cdn2.steamgriddb.com";
  } catch {
    return false;
  }
}

type FormData = z.infer<typeof updateImagesSchema>;

const CARD_VARIANTS: CollectionCardVariant[] = [
  "compact",
  "overlay",
  "slideUp",
];

type response = { id: string; url: string };

export const ChangeImagesView = ({ collectionId }: Props) => {
  const [link, setLink] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [filters] = useChangeImageFilters();

  const { cardType, directLink } = filters;

  const { data: game, isLoading: isLoadingGame } = useQuery(
    collectionGetByIdQueryOptions(collectionId),
  );

  const steamId = game?.steamGridDBId ?? game?.steamAppId;

  const { data: grids, isLoading: isLoadingGrid } = useQuery({
    queryKey: ["GRID", game?.id, game?.steamAppId, game?.steamGridDBId],
    queryFn: async () => {
      const response = await api.get<Array<response>>(`/steamGridDB/getGrids`, {
        params: {
          steamGridDBId: game?.steamGridDBId,
          steamAppId: game?.steamAppId,
        },
      });

      return response.data;
    },
    enabled: Boolean(steamId),
  });

  const { data: heros, isLoading: isLoadingHero } = useQuery({
    queryKey: ["HERO", game?.id, game?.steamAppId, game?.steamGridDBId],
    queryFn: async () => {
      const response = await api.get<Array<response>>(`/steamGridDB/getHeros`, {
        params: {
          steamGridDBId: game?.steamGridDBId,
          steamAppId: game?.steamAppId,
        },
      });

      return response.data;
    },
    enabled: Boolean(steamId),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(updateImagesSchema),
    defaultValues: {
      customImage: null,
      customCoverImage: null,
    },
  });

  useEffect(() => {
    if (game) {
      if (!game.steamAppId && !game.steamGridDBId) {
        setLink(true);
      }
      form.reset({
        customImage: game.customImage ?? null,
        customCoverImage: game.customCoverImage ?? null,
      });
    }
  }, [game, form]);

  const update = useMutation({
    mutationFn: async (values: FormData) => {
      await api.patch(`/collection/${collectionId}/update/images`, {
        customImage: values.customImage,
        customCoverImage: values.customCoverImage,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getById(collectionId),
      });
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getMany(),
      });
      toast.success("Images updated");
    },
    onError: (e) => showError(e),
  });

  async function onSubmit(values: FormData) {
    update.mutateAsync({ ...values });
  }

  const customImage = form.watch("customImage");
  const customCoverImage = form.watch("customCoverImage");

  const previewImage =
    !!customImage &&
    !form.formState.errors.customImage &&
    isSteamGridDbImage(customImage);

  const previewCoverImage =
    !!customCoverImage &&
    !form.formState.errors.customCoverImage &&
    isSteamGridDbImage(customCoverImage);

  const isPending = update.isPending;

  if (isLoadingGame || !game) {
    return <Spinner />;
  }

  const totalAmount =
    Number(game.amount) +
    game.dlcs.reduce((acc, dlc) => acc + Number(dlc.amount), 0);

  const totalPlaytime =
    Number(game.totalTime) +
    game.dlcs.reduce((acc, dlc) => acc + Number(dlc.totalTime), 0);

  const cardData: CollectionGetMany = {
    ...game,
    listIds: [],
    totalAmount,
    totalPlaytime,
    customImage: previewImage ? customImage : game.image,
  };

  return (
    <>
      <InstructionsModal
        open={open}
        setOpen={setOpen}
      />

      <LinkGameModal
        open={link}
        onOpenChange={(value) => {
          if (!game.steamAppId && !game.steamGridDBId) return;
          setLink(value);
        }}
        name={game.name}
        collectionId={collectionId}
      />

      <Tabs defaultValue="Grid">
        <div className="flex items-center justify-between">
          <TabsList variant="line">
            <TabsTrigger value="Grid">Grid</TabsTrigger>
            <TabsTrigger value="Hero">Hero</TabsTrigger>
          </TabsList>

          <div className="flex items-center ml-auto">
            <Filters />
            <form
              className="flex items-center gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                disabled={isPending}
                onClick={() => setOpen(true)}
              >
                <HelpCircleIcon className="size-5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                disabled={isPending || !form.formState.isDirty}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="secondary"
                disabled={isPending || !form.formState.isDirty}
              >
                Save
              </Button>
            </form>
          </div>
        </div>

        <TabsContent value="Grid">
          <div className="bg-card border-border border-2 rounded-xl p-3">
            {isLoadingGrid ? (
              <ScrollArea className="h-140">
                <CollectionLoading />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : grids && !directLink ? (
              <ScrollArea className="h-140">
                <div className="flex flex-wrap items-center gap-6 justify-center">
                  {grids.map((g) => (
                    <CollectionCard
                      key={g.id}
                      game={{ ...cardData, customImage: g.url }}
                      variant={cardType}
                      showcase
                    />
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : (
              <div className="flex flex-col gap-4">
                <FormInput
                  name="customImage"
                  control={form.control}
                  disabled={isPending}
                  type="text"
                  placeholder="Image"
                />

                <div className="flex flex-wrap items-center gap-6 justify-center">
                  {CARD_VARIANTS.map((variant, idx) => (
                    <CollectionCard
                      key={`${idx}-${variant}`}
                      game={cardData}
                      variant={variant}
                      showcase
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="Hero">
          <Card>
            <CardContent className="space-y-4">
              <FormInput
                name="customCoverImage"
                control={form.control}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};
