import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn, handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlatformType } from "@repo/schemas/types/index";
import { addCollectionBundleMutationOptions } from "@repo/utils/mutations/collection";
import { getByIdQueryOptions } from "@repo/utils/queries/igdb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import {
  buildCollections,
  parseAmount,
  splitAmount,
  toCents,
} from "@repo/utils/lib/gameBundle";

import {
  FormDatePicker,
  FormInput,
  FormMultiSelectSheet,
  FormSelectSheet,
} from "@/components/form/form";

import {
  getOwnershipTypeOptions,
  PLATFORM_OPTIONS,
  PROVIDER_OPTIONS,
  PS_VERSION_OPTIONS,
} from "@repo/utils/lib/gameOptions";

import {
  createCollectionBundleSchema,
  CreateCollectionBundleSchemaType,
} from "@repo/schemas/schemas/collection";

const AddBundle = () => {
  const { igdbId } = useLocalSearchParams<{ igdbId: string }>();
  const theme = useThemeStore((s) => s.theme);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: game, isLoading: isLoadingGame } = useQuery(
    getByIdQueryOptions(api, Number(igdbId)),
  );

  const addBundle = useMutation(
    addCollectionBundleMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        showToast("success", "Bundle Added");
        router.back();
      },
    ),
  );

  const form = useForm<CreateCollectionBundleSchemaType>({
    resolver: zodResolver(createCollectionBundleSchema),
    defaultValues: {
      dateOfPurchase: null,
      amount: null,
      platform: "PC",
      provider: "Steam",
      PSVersion: [],
      ownershipType: "Bought",
      lists: null,
      collections: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "collections",
  });

  const selectedPlatform = form.watch("platform");
  const rootAmount = form.watch("amount");
  const collectionValues = form.watch("collections");

  // Fill the games once, a refetch must not overwrite the user's edits
  const initialized = useRef(false);
  useEffect(() => {
    if (!game || initialized.current) return;
    initialized.current = true;
    replace(buildCollections(game));
  }, [game, replace]);

  const total = parseAmount(rootAmount);
  const totalIsValid = total !== null && !Number.isNaN(total);

  // Even split, used when no per-game amount has been typed
  const shares = useMemo(
    () => (totalIsValid ? splitAmount(total, fields.length) : null),
    [total, totalIsValid, fields.length],
  );

  // Manual mode: as soon as one game has an amount, every game needs one
  const entered = (collectionValues ?? []).map((c) => parseAmount(c.amount));
  const isManual = fields.length > 1 && entered.some((a) => a !== null);
  const enteredCents = entered.reduce<number>(
    (sum, a) => sum + (a !== null && !Number.isNaN(a) ? toCents(a) : 0),
    0,
  );
  const remainingCents = totalIsValid ? toCents(total) - enteredCents : null;

  async function onSubmit(values: CreateCollectionBundleSchemaType) {
    const bundleTotal = parseAmount(values.amount);

    if (Number.isNaN(bundleTotal)) {
      form.setError("amount", { message: "Enter a valid amount" });
      return;
    }

    const amounts = values.collections.map((c) => parseAmount(c.amount));
    const manual =
      values.collections.length > 1 && amounts.some((a) => a !== null);

    let perGame: string[] | null;

    if (manual) {
      let hasError = false;

      amounts.forEach((a, i) => {
        if (a === null) {
          hasError = true;
          form.setError(`collections.${i}.amount`, {
            message: "Enter an amount for every game, or clear them all",
          });
        } else if (Number.isNaN(a)) {
          hasError = true;
          form.setError(`collections.${i}.amount`, {
            message: "Enter a valid amount",
          });
        }
      });

      if (bundleTotal === null) {
        hasError = true;
        form.setError("amount", {
          message: "Enter the bundle price the game amounts should add up to",
        });
      }

      if (hasError || bundleTotal === null) return;

      const sumCents = amounts.reduce<number>(
        (sum, a) => sum + toCents(a as number),
        0,
      );

      if (sumCents !== toCents(bundleTotal)) {
        form.setError("amount", {
          message: `Game amounts add up to ${(sumCents / 100).toFixed(2)}, but the bundle price is ${bundleTotal.toFixed(2)}`,
        });
        return;
      }

      perGame = amounts.map((a) => (a as number).toFixed(2));
    } else {
      perGame =
        bundleTotal === null
          ? null
          : splitAmount(bundleTotal, values.collections.length);
    }

    const payload: CreateCollectionBundleSchemaType = {
      ...values,
      collections: values.collections.map((c, i) => ({
        ...c,
        amount: perGame ? perGame[i] : null,
        // DLCs in a bundle are free and always Included
        DLCs: c.DLCs?.map((d) => ({
          ...d,
          amount: null,
          dateOfPurchase: values.dateOfPurchase,
          ownershipType: "Included" as const,
        })),
      })),
    };

    await addBundle.mutateAsync(payload);
  }

  const isPending = addBundle.isPending;

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

  if (!game.isBundle || game.bundleGames.length === 0) {
    return (
      <View className="flex-1">
        <Header />

        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center text-muted-foreground">
            This game is not a bundle.
          </Text>
          <Button
            variant="outline"
            onPress={() => router.back()}
          >
            <Text>Go back</Text>
          </Button>
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
          {/* Bundle summary */}
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
              <Text className="text-2xl font-bold tracking-tight">
                Add Bundle
              </Text>
              <Text className="text-sm text-muted-foreground">{game.name}</Text>
              <Text className="text-sm text-muted-foreground">
                {game.bundleGames.length} game
                {game.bundleGames.length === 1 ? "" : "s"} ·{" "}
                {game.bundleDlcs.length} DLC
                {game.bundleDlcs.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>

          {/* Bundle-wide details */}
          <View className="gap-4">
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
                  label="Bundle Price (Defaults to 0)"
                  placeholder="e.g. 100"
                  keyboardType="decimal-pad"
                  disabled={isPending}
                />
              </View>
            </View>

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

            {selectedPlatform === "PS" && (
              <FormMultiSelectSheet
                name="PSVersion"
                control={form.control}
                label="PS Version*"
                options={PS_VERSION_OPTIONS}
                disabled={isPending}
              />
            )}

            <FormSelectSheet
              name="ownershipType"
              control={form.control}
              label="Ownership Type*"
              options={getOwnershipTypeOptions(false)}
              disabled={isPending}
            />
          </View>

          {/* Games in the bundle */}
          <View className="gap-3 border-t border-border pt-4">
            <View className="gap-1">
              <Text className="text-sm font-medium text-muted-foreground">
                Games in this bundle
              </Text>
              {fields.length > 1 && (
                <Text className="text-xs text-muted-foreground">
                  Leave the amounts empty to split the bundle price evenly, or
                  enter an amount for every game. DLCs are always free.
                </Text>
              )}
              {isManual && remainingCents !== null && (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    remainingCents === 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {remainingCents === 0
                    ? "Amounts add up to the bundle price"
                    : remainingCents > 0
                      ? `${(remainingCents / 100).toFixed(2)} left to assign`
                      : `${(Math.abs(remainingCents) / 100).toFixed(2)} over the bundle price`}
                </Text>
              )}
            </View>

            {fields.map((field, index) => {
              const dlcs = field.DLCs ?? [];

              return (
                <View
                  key={field.id}
                  className="gap-3 rounded-md border border-border bg-card p-3"
                >
                  <View className="flex-row items-center gap-3">
                    {field.image && (
                      <Image
                        source={{ uri: field.image }}
                        style={{
                          width: 48,
                          height: 64,
                          borderRadius: 6,
                          backgroundColor: THEME[theme].muted,
                        }}
                        contentFit="cover"
                      />
                    )}
                    <Text
                      numberOfLines={2}
                      className="flex-1 text-sm font-medium"
                    >
                      {field.name}
                    </Text>
                  </View>

                  <FormInput
                    name={`collections.${index}.name`}
                    control={form.control}
                    label="Name*"
                    placeholder="Game name"
                    disabled={isPending}
                  />

                  {fields.length > 1 && (
                    <FormInput
                      name={`collections.${index}.amount`}
                      control={form.control}
                      label="Amount"
                      placeholder={
                        isManual ? "Required" : (shares?.[index] ?? "0")
                      }
                      keyboardType="decimal-pad"
                      disabled={isPending}
                    />
                  )}

                  {dlcs.length > 0 && (
                    <View className="gap-1 rounded-md bg-muted p-2">
                      <Text className="text-xs font-medium text-muted-foreground">
                        {dlcs.length} DLC{dlcs.length === 1 ? "" : "s"} included
                        (free)
                      </Text>
                      {dlcs.map((d) => (
                        <Text
                          key={d.igdbId}
                          numberOfLines={1}
                          className="text-xs text-foreground"
                        >
                          • {d.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isPending || fields.length === 0}
            >
              <Text>{isPending ? "Adding..." : "Add Bundle"}</Text>
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
    </View>
  );
};

export default AddBundle;
