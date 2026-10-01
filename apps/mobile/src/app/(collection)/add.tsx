import Header from "@/components/Header";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { api } from "@/lib/api";
import { handleError, showToast } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DLCs } from "@repo/schemas/types/igdb";
import { addCollectionMutationOptions } from "@repo/utils/mutations/collection";
import { CollectionQueryKeys } from "@repo/utils/queries/collection";
import { getByIdQueryOptions } from "@repo/utils/queries/igdb";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";
import { StatsQueryKeys } from "@repo/utils/queries/stats";
import { userGetCollectionQueryOptions } from "@repo/utils/queries/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { View } from "react-native";

import {
  createCollectionSchema,
  CreateCollectionSchemaType,
} from "@repo/schemas/schemas/collection";

const AddCollection = () => {
  const { igdbId } = useLocalSearchParams<{ igdbId: string }>();
  const [dlcOpen, setDlcOpen] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lists, isLoading: isLoadingLists } = useQuery(
    listGetManyQueryOptions(api),
  );
  const { data: game, isLoading: isLoadingGame } = useQuery(
    getByIdQueryOptions(api, Number(igdbId)),
  );

  const listOptions = lists?.map((d) => ({ label: d.name, value: d.id }));

  const addGame = useMutation(addCollectionMutationOptions(api));

  const form = useForm<CreateCollectionSchemaType>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      igdbId: Number(igdbId),
      name: "",
      dateOfPurchase: new Date().toISOString(),
      edition: null,
      amount: "",
      platform: "PC",
      provider: "Steam",
      PSVersion: "PS5",
      ownershipType: "Bought",
      image: null,
      coverImage: null,
      steamAppId: null,
      lists: null,
      isDLC: false,
      collectionId: "",
      DLCs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "DLCs",
  });

  const watchedName = form.watch("name");
  const watchedImage = form.watch("image");
  const watchedCoverImage = form.watch("coverImage");
  const steamAppId = form.watch("steamAppId");
  const isDlc = form.watch("isDLC");
  const watchedCollectionId = form.watch("collectionId");

  if (game?.name && !watchedName) form.setValue("name", game.name);
  if (game?.image && !watchedImage) form.setValue("image", game.image);
  if (game?.coverImage && !watchedCoverImage)
    form.setValue("coverImage", game.coverImage);
  if (game?.steamAppId && !steamAppId)
    form.setValue("steamAppId", game.steamAppId);
  if (game?.isDlc && !isDlc) form.setValue("isDLC", game.isDlc);

  const selectedPlatform = form.watch("platform");

  // Map igdbId → field-array index for O(1) lookup
  const dlcIndexMap = new Map(fields.map((f, i) => [f.igdbId, i]));

  const { data: userGames, isLoading: isLoadingUserGames } = useQuery(
    userGetCollectionQueryOptions(api, isDlc ?? false),
  );

  const parentGame = isDlc
    ? userGames?.games.find(
        (ug) => ug.igdbId === String(game?.parentGameIgdbId),
      )
    : undefined;

  if (parentGame && !watchedCollectionId)
    form.setValue("collectionId", parentGame.id);

  function toggleDlc(dlc: DLCs) {
    if (dlcIndexMap.has(dlc.id)) {
      remove(dlcIndexMap.get(dlc.id)!);
    } else {
      append({
        igdbId: dlc.id,
        name: dlc.name,
        amount: "",
        dateOfPurchase: new Date().toISOString(),
        image: dlc.image ?? null,
        coverImage: dlc.coverImage ?? null,
        steamAppId: String(dlc.steamAppId),
        ownershipType: "Bought",
      });
    }
  }

  async function onSubmit(values: CreateCollectionSchemaType) {
    await addGame.mutateAsync(
      { ...values },

      {
        onSuccess: async () => {
          showToast("success", "Game Added");
          await queryClient.invalidateQueries({
            queryKey: StatsQueryKeys.getStats(),
          });
          await queryClient.invalidateQueries({
            queryKey: CollectionQueryKeys.getMany(),
          });
          router.back();
        },

        onError: (e) => {
          handleError(e);
        },
      },
    );
  }

  const isPending = addGame.isPending;
  const isLoading = isLoadingGame || isLoadingLists || isLoadingUserGames;

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1"></View>
      </ScreenWrapper>
    </View>
  );
};

export default AddCollection;
