import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { handleError, showToast } from "@/lib/utils";
import { collectionIdParams } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlatformType } from "@repo/schemas/types/index";
import { updateCollectionMutationOptions } from "@repo/utils/mutations/collection";
import { collectionGetByIdForEditQueryOptions } from "@repo/utils/queries/collection";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Image, ScrollView, View } from "react-native";

import {
  FormDatePicker,
  FormInput,
  FormMultiSelectSheet,
  FormSelectSheet,
} from "@/components/form/form";

import {
  getGameStatusOptions,
  getOwnershipTypeOptions,
  PLATFORM_OPTIONS,
  PROVIDER_OPTIONS,
  PS_VERSION_OPTIONS,
} from "@repo/utils/lib/gameOptions";

import Loader from "@/components/Loader";
import {
  updateCollectionSchema,
  UpdateCollectionSchemaType,
} from "@repo/schemas/schemas/collection";

export default function EditCollection() {
  const { collectionId } = useLocalSearchParams<collectionIdParams>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery(
    collectionGetByIdForEditQueryOptions(api, collectionId),
  );

  const { data: lists, isLoading: isLoadingLists } = useQuery(
    listGetManyQueryOptions(api),
  );

  const listOptions = (lists ?? []).map((l) => ({
    label: l.name,
    value: l.id,
  }));

  const updateGame = useMutation(
    updateCollectionMutationOptions(
      api,
      queryClient,
      collectionId,
      (err) => handleError(err),
      () => {
        showToast("success", "Game Updated");
        router.back();
      },
    ),
  );

  const form = useForm<UpdateCollectionSchemaType>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      name: "",
      edition: null,
      dateOfPurchase: null,
      amount: null,
      platform: "PC",
      provider: "Steam",
      status: "Backlog",
      PSVersion: [],
      ownershipType: "Bought",
      lists: [],
    },
  });

  // Populate the form once the game loads
  useEffect(() => {
    if (!data) return;

    form.reset({
      name: data.name,
      edition: data.edition ?? null,
      dateOfPurchase: data.dateOfPurchase
        ? new Date(data.dateOfPurchase).toISOString()
        : null,
      amount: data.amount != null ? String(data.amount) : null,
      platform: data.platform,
      provider: data.provider,
      status: data.status,
      PSVersion: data.PSVersion ?? [],
      ownershipType: data.ownershipType,
      lists: data.lists.map((l) => l.id),
    });
  }, [data, form]);

  const selectedPlatform = form.watch("platform");

  async function onSubmit(values: UpdateCollectionSchemaType) {
    await updateGame.mutateAsync({
      ...values,
      PSVersion: values.platform === "PS" ? values.PSVersion : [],
    });
  }

  const isPending = updateGame.isPending;

  if (isLoading) {
    return (
      <View className="flex-1">
        <Header />

        <ScreenWrapper paddingTop={12}>
          <View className="flex-1 items-center justify-center">
            <Loader />
          </View>
        </ScreenWrapper>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1">
        <Header />

        <ScreenWrapper paddingTop={12}>
          <View className="flex-1 items-center justify-center gap-3 px-6">
            <Text className="text-center text-muted-foreground">
              {error?.message ?? "Could not load this game."}
            </Text>
            <Button
              variant="outline"
              onPress={() => router.back()}
            >
              <Text>Go back</Text>
            </Button>
          </View>
        </ScreenWrapper>
      </View>
    );
  }

  const imageUri = data.customImage ?? data.image;

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <ScrollView
          contentContainerClassName="gap-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Game summary */}
          <View className="flex-row items-center gap-4">
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                className="h-24 w-[72px] rounded-md bg-muted"
                resizeMode="cover"
              />
            )}
            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold tracking-tight">
                Edit Game
              </Text>
              <Text className="text-sm text-muted-foreground">
                Update the details of this game in your collection.
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <FormInput
              name="name"
              control={form.control}
              label="Name*"
              placeholder="Game name"
              disabled={isPending}
            />

            <FormInput
              name="edition"
              control={form.control}
              label="Edition"
              placeholder="e.g. Deluxe, GOTY, Standard"
              disabled={isPending}
            />

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
                  label="Amount (Defaults to 0)"
                  placeholder="e.g. 59.99"
                  keyboardType="decimal-pad"
                  disabled={isPending}
                />
              </View>
            </View>

            {/* Platform + Provider */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FormSelectSheet
                  name="platform"
                  control={form.control}
                  label="Platform*"
                  options={PLATFORM_OPTIONS}
                  disabled={isPending}
                  onValueChange={(p) =>
                    form.setValue(
                      "provider",
                      PROVIDER_OPTIONS[p as PlatformType][0].value,
                    )
                  }
                />
              </View>
              <View className="flex-1">
                <FormSelectSheet
                  name="provider"
                  control={form.control}
                  label="Provider*"
                  options={PROVIDER_OPTIONS[selectedPlatform]}
                  disabled={isPending}
                />
              </View>
            </View>

            {/* PS Version */}
            {selectedPlatform === "PS" && (
              <FormMultiSelectSheet
                name="PSVersion"
                control={form.control}
                label="PS Version*"
                options={PS_VERSION_OPTIONS}
                disabled={isPending}
              />
            )}

            {/* Status + Ownership */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FormSelectSheet
                  name="status"
                  control={form.control}
                  label="Status*"
                  options={getGameStatusOptions({
                    completions: 0,
                    isDLC: false,
                  })}
                  disabled={isPending}
                />
              </View>
              <View className="flex-1">
                <FormSelectSheet
                  name="ownershipType"
                  control={form.control}
                  label="Ownership Type*"
                  options={getOwnershipTypeOptions(false)}
                  disabled={isPending}
                />
              </View>
            </View>

            <FormMultiSelectSheet
              name="lists"
              control={form.control}
              label="Custom Lists"
              placeholder="Select custom lists"
              options={listOptions}
              disabled={isPending || isLoadingLists}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isPending || isLoadingLists}
            >
              <Text>{isPending ? "Saving..." : "Save Changes"}</Text>
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
}
