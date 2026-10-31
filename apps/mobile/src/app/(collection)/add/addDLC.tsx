import Header from "@/components/Header";
import Loader from "@/components/Loader";
import SelectableListSheet from "@/components/SelectableListSheet";
import SelectableListSheetCard from "@/components/SelectableListSheetCard";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn, handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetGamesType } from "@repo/schemas/types/user";
import { getOwnershipTypeOptions } from "@repo/utils/lib/gameOptions";
import { addCollectionMutationOptions } from "@repo/utils/mutations/collection";
import { getByIdQueryOptions } from "@repo/utils/queries/igdb";
import { userGetCollectionQueryOptions } from "@repo/utils/queries/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronDownIcon } from "lucide-react-native";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import {
  FormDatePicker,
  FormInput,
  FormSelectSheet,
} from "@/components/form/form";

import {
  createCollectionSchema,
  CreateCollectionSchemaType,
} from "@repo/schemas/schemas/collection";

type GameItem = GetGamesType["games"][number];

const getSearchText = (item: GameItem) => item.name;

const AddDLC = () => {
  const { igdbId } = useLocalSearchParams<{ igdbId: string }>();
  const theme = useThemeStore((s) => s.theme);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: game, isLoading: isLoadingGame } = useQuery(
    getByIdQueryOptions(api, Number(igdbId)),
  );

  const addGame = useMutation(
    addCollectionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        showToast("success", "DLC Added");
        router.back();
      },
    ),
  );

  const form = useForm<CreateCollectionSchemaType>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      igdbId: Number(igdbId),
      name: "",
      dateOfPurchase: null,
      edition: null,
      amount: null,
      platform: "PC",
      provider: "Steam",
      PSVersion: [],
      ownershipType: "Bought",
      image: null,
      coverImage: null,
      steamAppId: null,
      lists: null,
      isDLC: true,
      collectionId: "",
      DLCs: [],
    },
  });

  const collectionId = form.watch("collectionId");

  const { data: userGames, isLoading: isLoadingUserGames } = useQuery(
    userGetCollectionQueryOptions(api, true),
  );

  const parentSheetRef = useRef<BottomSheetModal>(null);

  const selectedParent = userGames?.games.find((g) => g.id === collectionId);

  const getParentItems = useCallback(
    (): GameItem[] => userGames?.games ?? [],
    [userGames],
  );

  const handleSelectParent = (id: string) => {
    form.setValue("collectionId", id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    parentSheetRef.current?.dismiss();
  };

  const parentGame = userGames?.games.find(
    (ug) => ug.igdbId === String(game?.parentGameIgdbId),
  );

  // Prefill from IGDB once the DLC loads
  useEffect(() => {
    if (!game) return;
    if (game.name) form.setValue("name", game.name);
    if (game.image) form.setValue("image", game.image);
    if (game.coverImage) form.setValue("coverImage", game.coverImage);
    if (game.steamAppId) form.setValue("steamAppId", String(game.steamAppId));
  }, [game, form]);

  // Preselect the parent game when we already own it
  useEffect(() => {
    if (parentGame && !form.getValues("collectionId")) {
      form.setValue("collectionId", parentGame.id);
    }
  }, [parentGame, form]);

  async function onSubmit(values: CreateCollectionSchemaType) {
    await addGame.mutateAsync(values);
  }

  const isPending = addGame.isPending;
  const isLoading = isLoadingGame || isLoadingUserGames;

  if (isLoadingGame || !game) {
    return (
      <View className="flex-1">
        <Header />

        <View className="flex-1 items-center justify-center">
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <KeyboardAwareScrollView
          bottomOffset={170}
          contentContainerClassName="gap-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* DLC summary */}
          <View className="flex-row items-center gap-4">
            {game.image && (
              <Image
                source={{ uri: game.image }}
                style={{
                  width: 72,
                  height: 96,
                  borderRadius: 8,
                  backgroundColor: THEME[theme].muted,
                }}
                contentFit="cover"
              />
            )}
            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold tracking-tight">Add DLC</Text>
              <Text className="text-sm text-muted-foreground">
                Choose the parent game and fill in the details below.
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <FormInput
              name="name"
              control={form.control}
              label="Name*"
              placeholder="DLC name"
              disabled={isPending}
            />

            <FormSelectSheet
              name="ownershipType"
              control={form.control}
              label="Ownership Type*"
              options={getOwnershipTypeOptions(true)}
              disabled={isPending}
            />

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
                  label="Amount (Defaults to 0)"
                  placeholder="e.g. 59.99"
                  keyboardType="decimal-pad"
                  disabled={isPending}
                />
              </View>
            </View>

            {/* Parent game */}
            <Controller
              name="collectionId"
              control={form.control}
              render={({}) => (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    Parent Game*
                  </Text>

                  <Pressable
                    onPress={() => parentSheetRef.current?.present()}
                    disabled={isPending}
                    className={cn(
                      "h-10 dark:bg-input/30 flex-row items-center justify-between rounded-md border bg-card px-3",
                      form.formState.errors.collectionId
                        ? "border-destructive"
                        : "border-border",
                      isPending && "opacity-50",
                    )}
                  >
                    <Text
                      numberOfLines={1}
                      className={cn(
                        "flex-1 text-base",
                        selectedParent
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {selectedParent?.name ?? "Select parent game"}
                    </Text>
                    <ChevronDownIcon
                      size={16}
                      color={THEME[theme].mutedForeground}
                    />
                  </Pressable>

                  {form.formState.errors.collectionId && (
                    <Text className="text-sm text-destructive">
                      {form.formState.errors.collectionId.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isPending || isLoading}
            >
              <Text>{isPending ? "Adding..." : "Add DLC"}</Text>
            </Button>

            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={isPending}
            >
              <Text>Cancel</Text>
            </Button>
          </View>
        </KeyboardAwareScrollView>
      </ScreenWrapper>

      <SelectableListSheet<GameItem>
        sheetRef={parentSheetRef}
        getItems={getParentItems}
        getSearchText={getSearchText}
        emptyText={() => "No games found"}
        isLoading={isLoadingUserGames}
        confirmLabel="Select"
        onConfirm={handleSelectParent}
        renderItem={({ item, selected, onPress }) => (
          <SelectableListSheetCard
            item={item}
            selected={selected}
            onPress={onPress}
          />
        )}
      />
    </View>
  );
};

export default AddDLC;
