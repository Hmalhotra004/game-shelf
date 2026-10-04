import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
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
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  FormDatePicker,
  FormInput,
  FormMultiSelectSheet,
  FormSelectSheet,
} from "@/components/form/form";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

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
  const theme = useThemeStore((s) => s.theme);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lists, isLoading: isLoadingLists } = useQuery(
    listGetManyQueryOptions(api),
  );
  const { data: game, isLoading: isLoadingGame } = useQuery(
    getByIdQueryOptions(api, Number(igdbId)),
  );

  const listOptions = (lists ?? []).map((d) => ({
    label: d.name,
    value: d.id,
  }));

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

  if (isLoadingGame || !game) {
    return (
      <View className="flex-1">
        <Header />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  const dlcs = game.dlcs ?? [];
  const hasDlcs = dlcs.length > 0;
  const selectedCount = fields.length;

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <ScrollView
          contentContainerClassName="gap-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Game summary */}
          <View className="flex-row items-center gap-4">
            {game.coverImage && (
              <Image
                source={{ uri: game.image }}
                className="h-24 w-[72px] rounded-md bg-muted"
                resizeMode="cover"
              />
            )}
            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold tracking-tight">
                Add to Collection
              </Text>
              <Text className="text-sm text-muted-foreground">
                Fill in the details below to add this game to your collection.
              </Text>
            </View>
          </View>

          <View className="gap-4">
            {/* Name + Edition / Ownership (DLC) */}
            <FormInput
              name="name"
              control={form.control}
              label="Name"
              placeholder="Game name"
              disabled={isPending}
            />

            {!isDlc ? (
              <FormInput
                name="edition"
                control={form.control}
                label="Edition"
                placeholder="e.g. Deluxe, GOTY, Standard"
                disabled={isPending}
              />
            ) : (
              <FormSelectSheet
                name="ownershipType"
                control={form.control}
                label="Ownership Type"
                options={getOwnershipTypeOptions(true)}
                disabled={isPending}
              />
            )}

            {/* Date + Amount */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FormDatePicker
                  name="dateOfPurchase"
                  control={form.control}
                  label="Date of Purchase"
                  disabled={isPending}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  name="amount"
                  control={form.control}
                  label="Amount"
                  placeholder="e.g. 59.99"
                  keyboardType="decimal-pad"
                  disabled={isPending}
                />
              </View>
            </View>

            {/* Platform + Provider */}
            {!isDlc && (
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <FormSelectSheet
                    name="platform"
                    control={form.control}
                    label="Platform"
                    options={PLATFORM_OPTIONS}
                    disabled={isPending}
                    onValueChange={(p) =>
                      form.setValue(
                        "provider",
                        PROVIDERS[p as keyof typeof PROVIDERS].default,
                      )
                    }
                  />
                </View>
                <View className="flex-1">
                  <FormSelectSheet
                    name="provider"
                    control={form.control}
                    label="Provider"
                    options={[...PROVIDERS[selectedPlatform].options]}
                    disabled={isPending}
                  />
                </View>
              </View>
            )}

            {/* PS Version */}
            {selectedPlatform === "PS" && !isDlc && (
              <FormSelectSheet
                name="PSVersion"
                control={form.control}
                label="PS Version"
                options={PS_VERSION_OPTIONS}
                disabled={isPending}
              />
            )}

            {/* Ownership + Lists / Parent game (DLC) */}
            {!isDlc && (
              <>
                <FormSelectSheet
                  name="ownershipType"
                  control={form.control}
                  label="Ownership Type"
                  options={getOwnershipTypeOptions(false)}
                  disabled={isPending}
                />
                <FormMultiSelectSheet
                  name="lists"
                  control={form.control}
                  label="Custom Lists"
                  placeholder="Select custom lists"
                  options={listOptions}
                  disabled={isPending}
                />
              </>
            )}

            {isDlc && (
              <FormSelectSheet
                name="collectionId"
                control={form.control}
                label="Parent Game"
                placeholder="Select parent game"
                options={(userGames?.games ?? []).map((g) => ({
                  value: g.id,
                  label: g.name,
                }))}
                disabled={isPending}
              />
            )}
          </View>

          {/* DLCs */}
          {hasDlcs && (
            <View className="gap-3 border-t border-border pt-4">
              <Pressable
                onPress={() => setDlcOpen((o) => !o)}
                className="flex-row items-center gap-2 active:opacity-70"
              >
                {dlcOpen ? (
                  <ChevronUpIcon
                    size={16}
                    color={THEME[theme].mutedForeground}
                  />
                ) : (
                  <ChevronDownIcon
                    size={16}
                    color={THEME[theme].mutedForeground}
                  />
                )}
                <Text className="text-sm font-medium text-muted-foreground">
                  DLCs ({dlcs.length} available
                  {selectedCount > 0 && `, ${selectedCount} selected`})
                </Text>
              </Pressable>

              {dlcOpen &&
                dlcs.map((dlc) => {
                  const index = dlcIndexMap.get(dlc.id);
                  const checked = index !== undefined;

                  return (
                    <View
                      key={dlc.id}
                      className="gap-3 rounded-md border border-border bg-card p-3"
                    >
                      <Pressable
                        onPress={() => toggleDlc(dlc)}
                        disabled={isPending}
                        className="flex-row items-center gap-3"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleDlc(dlc)}
                          disabled={isPending}
                        />
                        <Text className="flex-1 text-sm">{dlc.name}</Text>
                      </Pressable>

                      {checked && (
                        <View className="gap-3">
                          <View className="flex-row gap-4">
                            <View className="flex-1">
                              <FormDatePicker
                                name={`DLCs.${index}.dateOfPurchase`}
                                control={form.control}
                                label="Date"
                                disabled={isPending}
                              />
                            </View>
                            <View className="flex-1">
                              <FormInput
                                name={`DLCs.${index}.amount`}
                                control={form.control}
                                label="Amount"
                                placeholder="0"
                                keyboardType="decimal-pad"
                                disabled={isPending}
                              />
                            </View>
                          </View>
                          <FormSelectSheet
                            name={`DLCs.${index}.ownershipType`}
                            control={form.control}
                            label="Ownership Type"
                            options={getOwnershipTypeOptions(true)}
                            disabled={isPending}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isPending || isLoading}
            >
              <Text>{isPending ? "Adding..." : "Add to Collection"}</Text>
            </Button>

            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={isPending}
            >
              <Text>Cancel</Text>
            </Button>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
};

export default AddCollection;
