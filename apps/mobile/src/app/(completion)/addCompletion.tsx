import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { GameType } from "@repo/schemas/types/index";
import { addCompletionMutationOptions } from "@repo/utils/mutations/completion";
import { getGameBasicInfo } from "@repo/utils/queries/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ImageIcon } from "lucide-react-native";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import {
  createCompletionSchema,
  CreateCompletionSchemaType,
} from "@repo/schemas/schemas/completion";

import {
  COMPLETION_STYLE_OPTIONS,
  getAfterCompletionStatusOptions,
  PS_VERSION_OPTIONS,
} from "@repo/utils/lib/gameOptions";

import {
  FormDatePicker,
  FormSelectSheet,
  FormTextarea,
  FormTimePicker,
} from "@/components/form/form";

const AddCompletion = () => {
  const { gameType, id } = useLocalSearchParams<{
    id: string;
    gameType: GameType;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);

  const isDlc = gameType === "DLC";

  const { data: game, isLoading: isLoadingGame } = useQuery(
    getGameBasicInfo(api, true, id, gameType),
  );

  const addCompletion = useMutation(
    addCompletionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        showToast("success", "Completion Added");
        router.dismissTo({ pathname: "/(tabs)/completion" });
      },
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
      completedAt: null,
      notes: null,
      collectionId: isDlc ? undefined : id,
      dlcId: isDlc ? id : undefined,
    },
  });

  async function onSubmit(values: CreateCompletionSchemaType) {
    await addCompletion.mutateAsync(values);
  }

  const isPending = addCompletion.isPending;

  useEffect(() => {
    if (!game) return;

    if (game.platform) form.setValue("platform", game.platform);
    if (game.PSVersion.length > 0) {
      if (game.PSVersion.length === 1)
        form.setValue("PSVersion", game.PSVersion[0]);
    }
  }, [game, form]);

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

  const selectedPlatform = form.watch("platform");
  const imageUri = game?.customImage ?? game.image;

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
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 96, height: 72 }}
                contentFit="cover"
                transition={250}
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-muted">
                <ImageIcon
                  color={THEME[theme].mutedForeground}
                  size={32}
                />
              </View>
            )}

            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold tracking-tight">
                Add Completion
              </Text>
              <Text
                className="text-sm text-muted-foreground"
                numberOfLines={2}
              >
                {game.name}
              </Text>
            </View>
          </View>

          <View className="gap-4">
            {/* Style + Status */}
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

            {selectedPlatform === "PS" && !isDlc && (
              <FormSelectSheet
                name="PSVersion"
                control={form.control}
                label="PS Version*"
                options={PS_VERSION_OPTIONS}
                disabled={isPending}
              />
            )}

            {/* Playtime */}
            <FormTimePicker
              name="totalPlaytime"
              control={form.control}
              label="Time Played*"
              disabled={isPending}
              inBottomSheet={false}
            />

            {/* Completed date */}
            <FormDatePicker
              name="completedAt"
              control={form.control}
              label="Completed On"
              disabled={isPending}
            />

            {/* Notes */}
            <FormTextarea
              name="notes"
              control={form.control}
              label="Notes"
              placeholder="Anything worth remembering..."
              numberOfLines={4}
              disabled={isPending}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text>{isPending ? "Adding..." : "Add Completion"}</Text>
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

export default AddCompletion;
