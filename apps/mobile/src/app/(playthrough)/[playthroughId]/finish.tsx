import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn, handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { GameType } from "@repo/schemas/types/index";
import { MAX_NOTES_CHARACTERS } from "@repo/utils/constants";
import { addCompletionMutationOptions } from "@repo/utils/mutations/completion";
import { deletePlaythroughMutationOptions } from "@repo/utils/mutations/playthrough";
import { getByIdPlayQueryOptions } from "@repo/utils/queries/playthrough";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ImageIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import {
  createCompletionSchema,
  CreateCompletionSchemaType,
} from "@repo/schemas/schemas/completion";

import {
  COMPLETION_STYLE_OPTIONS,
  getAfterCompletionStatusOptions,
  opts,
  PS_VERSION_OPTIONS,
} from "@repo/utils/lib/gameOptions";

import {
  FormDatePicker,
  FormSelectSheet,
  FormTextarea,
  FormTimePicker,
} from "@/components/form/form";

const FinishPlaythrough = () => {
  const { playthroughId, gameType } = useLocalSearchParams<{
    playthroughId: string;
    gameType: GameType;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);

  const isDlc = gameType === "DLC";
  const [deleteAfter, setDeleteAfter] = useState(false);
  const initialized = useRef(false);

  const { data, isLoading, isError, refetch } = useQuery(
    getByIdPlayQueryOptions(api, true, playthroughId, gameType),
  );

  const addCompletion = useMutation(
    addCompletionMutationOptions(api, queryClient, (err) => handleError(err)),
  );

  const deletePlaythrough = useMutation(
    deletePlaythroughMutationOptions(api, queryClient, (err) =>
      handleError(err),
    ),
  );

  const form = useForm<CreateCompletionSchemaType>({
    resolver: zodResolver(createCompletionSchema),
    defaultValues: {
      gameType,
      completionStyle: "Story",
      completionStatus: "Story Completed",
      totalPlaytime: 0,
      platform: "PC",
      PSVersion: null,
      completedAt: new Date().toISOString(),
      notes: null,
      collectionId: undefined,
      dlcId: undefined,
      playthroughId: playthroughId,
    },
  });

  // prefill once from the playthrough (a refetch must not wipe the user's edits)
  useEffect(() => {
    if (!data || initialized.current) return;
    initialized.current = true;

    form.reset({
      gameType,
      completionStyle: "Story",
      completionStatus: "Story Completed",
      totalPlaytime: data.totalSeconds ?? 0,
      platform: data.platform,
      PSVersion: data.PSVersion?.length === 1 ? data.PSVersion[0] : null,
      completedAt: new Date().toISOString(),
      notes: null,
      collectionId: isDlc ? undefined : (data.collectionId ?? undefined),
      dlcId: isDlc ? (data.dlcId ?? undefined) : undefined,
      playthroughId,
    });
  }, [data, form, gameType, isDlc]);

  const isPending = addCompletion.isPending || deletePlaythrough.isPending;

  async function onSubmit(values: CreateCompletionSchemaType) {
    try {
      await addCompletion.mutateAsync(values);
    } catch {
      return; // error toast comes from the mutation's onError
    }

    if (deleteAfter) {
      try {
        await deletePlaythrough.mutateAsync(playthroughId);
      } catch {
        // completion is saved; the error toast already explained the failure
      }
    }

    showToast(
      "success",
      deleteAfter ? "Playthrough finished and deleted" : "Playthrough finished",
    );
    router.dismissTo({ pathname: "/(tabs)/completion" });
  }

  if (isLoading) {
    return (
      <View className="flex-1">
        <Header />

        <View className="flex-1 items-center justify-center">
          <Loader />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1">
        <Header />

        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-muted-foreground">
            Couldn't load this playthrough.
          </Text>
          <Button
            variant="outline"
            onPress={() => refetch()}
          >
            <Text>Try again</Text>
          </Button>
        </View>
      </View>
    );
  }

  const notes = form.watch("notes");
  const selectedPlatform = form.watch("platform");
  const imageUri = data.customImage ?? data.image;

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <KeyboardAwareScrollView
          bottomOffset={24}
          contentContainerClassName="gap-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Game summary */}
          <View className="flex-row items-center gap-4">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 72,
                  height: 96,
                  borderRadius: 8,
                  backgroundColor: THEME[theme].muted,
                }}
                contentFit="cover"
              />
            ) : (
              <View className="h-24 w-[72px] items-center justify-center rounded-lg bg-muted">
                <ImageIcon
                  color={THEME[theme].mutedForeground}
                  size={32}
                />
              </View>
            )}

            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold tracking-tight">
                {isDlc && data.dlcName ? data.dlcName : data.name}
              </Text>
              {isDlc && data.dlcName ? (
                <Text className="text-sm text-muted-foreground">
                  {data.name}
                </Text>
              ) : null}
              <Text className="text-sm text-muted-foreground">
                Review the details below to finish this playthrough.
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <FormSelectSheet
              name="completionStyle"
              control={form.control}
              label="Completion Style*"
              options={COMPLETION_STYLE_OPTIONS}
              disabled={isPending}
            />

            <FormSelectSheet
              name="completionStatus"
              control={form.control}
              label="Completion Status*"
              options={getAfterCompletionStatusOptions(isDlc)}
              disabled={isPending}
            />

            {selectedPlatform === "PS" && (
              <FormSelectSheet
                name="PSVersion"
                control={form.control}
                label="PS Version*"
                options={
                  data.PSVersion?.length
                    ? opts(...data.PSVersion)
                    : PS_VERSION_OPTIONS
                }
                disabled={isPending}
              />
            )}

            <FormDatePicker
              name="completedAt"
              control={form.control}
              label="Completed On"
              disabled={isPending}
            />

            <FormTimePicker
              name="totalPlaytime"
              control={form.control}
              label="Time Played*"
              disabled={isPending}
              inBottomSheet={false}
            />

            {/* Notes */}
            <View>
              <FormTextarea
                name="notes"
                control={form.control}
                label="Notes"
                placeholder="Anything worth remembering..."
                numberOfLines={4}
                disabled={isPending}
              />
              <View className="flex-row justify-between">
                <Text className="text-xs text-destructive">
                  {form.formState.errors.notes?.message ?? ""}
                </Text>
                <Text
                  className={cn(
                    "text-xs text-muted-foreground",
                    form.formState.errors.notes?.message && "text-destructive",
                  )}
                >
                  {notes?.length ?? 0}/{MAX_NOTES_CHARACTERS}
                </Text>
              </View>
            </View>

            {/* Delete playthrough after finishing */}
            <View className="flex-row items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
              <View className="flex-1 gap-0.5">
                <Text className="font-semibold">Delete playthrough</Text>
                <Text className="text-xs text-muted-foreground">
                  Remove this playthrough after the completion is saved.
                </Text>
              </View>

              <Switch
                checked={deleteAfter}
                onCheckedChange={setDeleteAfter}
                disabled={isPending}
              />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text>{isPending ? "Saving..." : "Finish Playthrough"}</Text>
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

export default FinishPlaythrough;
