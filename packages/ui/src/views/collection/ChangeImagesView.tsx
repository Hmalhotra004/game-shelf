import { zodResolver } from "@hookform/resolvers/zod";
import { updateImagesSchema } from "@repo/schemas/schemas/collection";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { HeroSection } from "@repo/ui/components/collection/HeroSection";
import { FormInput } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { api } from "@repo/ui/lib/api";
import { showError } from "@repo/ui/lib/utils";
import { CollectionQueryKeys } from "@repo/ui/queries/collection/collection.keys";
import { collectionGetByIdQueryOptions } from "@repo/ui/queries/collection/collection.queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircleIcon, MoveLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  CollectionCard,
  CollectionCardVariant,
} from "@repo/ui/components/collection/CollectionCard";

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

export const ChangeImagesView = ({ collectionId }: Props) => {
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
      queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getById(collectionId),
      });
      queryClient.invalidateQueries({
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
    return null;
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
      {/* <ChangeImageInstructionsModal
        open={open}
        setOpen={setOpen}
      /> */}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            // onClick={() => router.back()}
            disabled={isPending}
          >
            <MoveLeftIcon className="mr-2 size-4" />
            Go Back
          </Button>

          <form
            className="flex items-center gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              disabled={isPending}
              onClick={() => setOpen(true)}
            >
              <HelpCircleIcon />
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

        <Card>
          <CardContent>
            <FormInput
              name="customImage"
              control={form.control}
              disabled={isPending}
              type="text"
              placeholder="Image"
            />

            <div className="flex items-center gap-8 justify-center mt-4">
              {CARD_VARIANTS.map((variant, idx) => (
                <CollectionCard
                  key={`${idx}-${variant}`}
                  game={cardData}
                  variant={variant}
                  showcase
                />
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>
    </>
  );
};
