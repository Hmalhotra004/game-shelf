import { zodResolver } from "@hookform/resolvers/zod";
import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import { Filters } from "@repo/ui/components/collection/changeImages/Filters";
import { GridImages } from "@repo/ui/components/collection/changeImages/GridImages";
import { HeroImages } from "@repo/ui/components/collection/changeImages/HeroImages";
import { InstructionsModal } from "@repo/ui/components/collection/changeImages/InstructionsModal";
import { LinkGameModal } from "@repo/ui/components/collection/changeImages/LinkGameModal";
import { Button } from "@repo/ui/components/ui/button";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { api } from "@repo/ui/lib/api";
import { showError } from "@repo/ui/lib/utils";
import { CollectionQueryKeys } from "@repo/ui/queries/collection/collection.keys";
import { collectionGetByIdQueryOptions } from "@repo/ui/queries/collection/collection.queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";

interface Props {
  collectionId: string;
}

type FormData = z.infer<typeof updateImagesSchema>;

export type ResponseType = {
  page: number;
  total: number;
  limit: number;
  data: {
    id: string;
    url: string;
  }[];
};

export const ChangeImagesView = ({ collectionId }: Props) => {
  const [link, setLink] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: game, isLoading: isLoadingGame } = useQuery(
    collectionGetByIdQueryOptions(collectionId),
  );

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

  const isPending = update.isPending;

  if (isLoadingGame || !game) {
    return (
      <div className="flex flex-col mt-24 h-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  const externalId = game.steamGridDBId ?? game.steamAppId;

  if (!externalId) {
    return (
      <LinkGameModal
        open={link}
        onOpenChange={(value) => {
          if (!game.steamAppId && !game.steamGridDBId) return;
          setLink(value);
        }}
        name={game.name}
        collectionId={collectionId}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <InstructionsModal
        open={open}
        setOpen={setOpen}
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
          <FormProvider {...form}>
            <GridImages
              game={game}
              isPending={isPending}
            />
          </FormProvider>
        </TabsContent>

        <TabsContent value="Hero">
          <FormProvider {...form}>
            <HeroImages
              game={game}
              isPending={isPending}
            />
          </FormProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
};
