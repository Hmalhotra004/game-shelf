import { FormInput, FormSelectSheet } from "@/components/form/form";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
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
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import {
  getOwnershipTypeOptions,
  PC_PROVIDER_OPTIONS,
  PLATFORM_OPTIONS,
  PS_PROVIDER_OPTIONS,
  PS_VERSION_OPTIONS,
  XBOX_PROVIDER_OPTIONS,
} from "@repo/utils/lib/gameOptions";

import {
  createCollectionSchema,
  CreateCollectionSchemaType,
} from "@repo/schemas/schemas/collection";

const PROVIDERS = {
  PC: { options: PC_PROVIDER_OPTIONS, default: "Steam" },
  PS: { options: PS_PROVIDER_OPTIONS, default: "PSN" },
  XBOX: { options: XBOX_PROVIDER_OPTIONS, default: "XBOX" },
} as const;

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

  const isDlc = form.watch("isDLC") ?? false;
  const selectedPlatform = form.watch("platform");

  const { data: userGames, isLoading: isLoadingUserGames } = useQuery(
    userGetCollectionQueryOptions(api, isDlc),
  );

  const parentGame = isDlc
    ? userGames?.games.find(
        (ug) => ug.igdbId === String(game?.parentGameIgdbId),
      )
    : undefined;

  // Prefill from IGDB once the game loads (was running on every render)
  useEffect(() => {
    if (!game) return;
    if (game.name) form.setValue("name", game.name);
    if (game.image) form.setValue("image", game.image);
    if (game.coverImage) form.setValue("coverImage", game.coverImage);
    if (game.steamAppId) form.setValue("steamAppId", game.steamAppId);
    if (game.isDlc) form.setValue("isDLC", game.isDlc);
  }, [game, form]);

  // Preselect the parent game when this is a DLC we already own
  useEffect(() => {
    if (parentGame && !form.getValues("collectionId")) {
      form.setValue("collectionId", parentGame.id);
    }
  }, [parentGame, form]);

  const dlcIndexMap = new Map(fields.map((f, i) => [f.igdbId, i]));

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
        onError: (e) => handleError(e),
      },
    );
  }

  const isPending = addGame.isPending;
  const isLoading = isLoadingGame || isLoadingLists || isLoadingUserGames;

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <ScrollView
          contentContainerClassName="gap-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <FormInput
            control={form.control}
            name="name"
            label="Name"
            disabled={isLoading}
          />

          <FormSelectSheet
            control={form.control}
            name="platform"
            label="Platform"
            options={PLATFORM_OPTIONS}
            onValueChange={(p) =>
              form.setValue(
                "provider",
                PROVIDERS[p as keyof typeof PROVIDERS].default,
              )
            }
          />

          <FormSelectSheet
            control={form.control}
            name="provider"
            label="Provider"
            options={[...PROVIDERS[selectedPlatform].options]}
          />

          {selectedPlatform === "PS" && (
            <FormSelectSheet
              control={form.control}
              name="PSVersion"
              label="PS Version"
              options={PS_VERSION_OPTIONS}
            />
          )}

          <FormSelectSheet
            control={form.control}
            name="ownershipType"
            label="Ownership Type"
            options={getOwnershipTypeOptions(isDlc)}
          />

          {isDlc && (
            <FormSelectSheet
              control={form.control}
              name="collectionId"
              label="Parent Game"
              placeholder="Select parent game"
              options={(userGames?.games ?? []).map((g) => ({
                value: g.id,
                label: g.name,
              }))}
            />
          )}

          <FormInput
            control={form.control}
            name="amount"
            label="Amount"
            keyboardType="decimal-pad"
            placeholder="0"
          />

          <Button
            onPress={form.handleSubmit(onSubmit)}
            disabled={isPending || isLoading}
          >
            <Text>{isPending ? "Adding..." : "Add Game"}</Text>
          </Button>
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
};

export default AddCollection;
