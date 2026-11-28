import { ErrorState } from "@/components/ErrorState";
import { FormDatePicker, FormTimePicker } from "@/components/form/form";
import FormBottomSheet from "@/components/form/FormBottomSheet";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useConfirmSheet } from "@/hooks/useConfirmSheet";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CasualSessionGetManyItem } from "@repo/schemas/types/casualSession";
import { GameType } from "@repo/schemas/types/index";
import { betterTimeText, secondsToHMS } from "@repo/utils/lib/utils";
import { collectionGetManyCasualSessionsQueryOptions } from "@repo/utils/queries/casualSession";
import { FlashList } from "@shopify/flash-list";
import { formatDate } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { PlusIcon, TrashIcon } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Control } from "react-hook-form";
import { Pressable, View } from "react-native";

import {
  addCasualSessionMutationOptions,
  deleteCasualSessionMutationOptions,
  updateCasualSessionMutationOptions,
} from "@repo/utils/mutations/casualSession";

import {
  casualSessionTimeSchema,
  CasualSessionTimeSchemaType,
} from "@repo/schemas/schemas/casualSession";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const SESSION_ROW_HEIGHT = 48;

const CasualSessions = () => {
  const { collectionId, dlcId } = useLocalSearchParams<{
    collectionId?: string;
    dlcId?: string;
  }>();

  const [editingSession, setEditingSession] =
    useState<CasualSessionGetManyItem | null>(null);

  const theme = useThemeStore((s) => s.theme);
  const queryClient = useQueryClient();

  const addTimeSheetRef = useRef<BottomSheetModal>(null);
  const editSessionSheetRef = useRef<BottomSheetModal>(null);

  const gameType: GameType = dlcId ? "DLC" : "Game";
  const canAdd = !!(collectionId || dlcId);

  const resolver = zodResolver(casualSessionTimeSchema);

  const getDefaults = (): CasualSessionTimeSchemaType => ({
    playDate: new Date().toISOString(),
    secondsPlayed: 0,
  });

  const TimeFields = ({
    control,
    disabled,
  }: {
    control: Control<CasualSessionTimeSchemaType>;
    disabled: boolean;
  }) => (
    <>
      <FormDatePicker
        control={control}
        name="playDate"
        label="Date"
        disabled={disabled}
      />
      <FormTimePicker
        control={control}
        name="secondsPlayed"
        label="Time played"
        disabled={disabled}
        inBottomSheet
      />
    </>
  );

  const filters = useMemo(
    () => ({
      gameType,
      collectionId: dlcId ? undefined : collectionId,
      dlcId,
    }),
    [gameType, collectionId, dlcId],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useInfiniteQuery(
    collectionGetManyCasualSessionsQueryOptions(api, filters),
  );

  const sessions = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // totals describe the whole filtered set, so page 1 is enough
  const total = data?.pages[0]?.total ?? 0;
  const totalSecs = data?.pages[0]?.totalSeconds ?? 0;

  const editInitialValues = useMemo<CasualSessionTimeSchemaType | undefined>(
    () =>
      editingSession
        ? {
            playDate: new Date(editingSession.playDate).toISOString(),
            secondsPlayed: editingSession.secondsPlayed,
          }
        : undefined,
    [editingSession],
  );

  // ----------------- Mutations -------------------------------

  const createSession = useMutation(
    addCasualSessionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => showToast("success", "Session Added"),
    ),
  );

  const updateSession = useMutation(
    updateCasualSessionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => showToast("success", "Session Updated"),
    ),
  );

  const deleteSession = useMutation(
    deleteCasualSessionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => showToast("success", "Deleted"),
    ),
  );

  // ----------------- Sheets -------------------------------

  const [DeleteSessionSheet, confirmDeleteSession] = useConfirmSheet(
    "Delete Session",
    "This session will be permanently removed. This can't be undone.",
    "Delete",
    "destructive",
  );

  // ----------------- Functions -------------------------------

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const addSession = useCallback(() => {
    addTimeSheetRef.current?.present();
  }, []);

  async function onSubmitSession(values: CasualSessionTimeSchemaType) {
    await createSession.mutateAsync({
      ...values,
      notes: null,
      gameType,
      collectionId: dlcId ? undefined : (collectionId ?? undefined),
      dlcId: dlcId ?? undefined,
    });
    addTimeSheetRef.current?.dismiss();
  }

  const editSession = useCallback((s: CasualSessionGetManyItem) => {
    setEditingSession(s);
    editSessionSheetRef.current?.present();
  }, []);

  async function onSubmitEditSession(values: CasualSessionTimeSchemaType) {
    if (!editingSession) return;
    await updateSession.mutateAsync({
      id: editingSession.id,
      notes: editingSession.notes ?? null, // keeps existing notes
      ...values,
    });
    editSessionSheetRef.current?.dismiss();
  }

  async function onDeleteSession(s: CasualSessionGetManyItem) {
    const ok = await confirmDeleteSession();
    if (!ok) return;

    deleteSession.mutate(s.id);
  }

  const renderItem = ({ item }: { item: CasualSessionGetManyItem }) => (
    <Pressable
      onPress={() => editSession(item)}
      className="flex-row items-center justify-between rounded-xl bg-muted pl-3.5 pr-1 active:opacity-70"
      style={{ minHeight: SESSION_ROW_HEIGHT }}
    >
      <View className="flex-1 py-2 pr-2">
        <Text className="text-sm">{formatDate(item.playDate, "PP")}</Text>
        {!!item.notes && (
          <Text
            className="text-2xs text-muted-foreground"
            numberOfLines={1}
          >
            {item.notes}
          </Text>
        )}
      </View>

      <View className="flex-row items-center">
        <Text className="text-sm font-semibold">
          {secondsToHMS(item.secondsPlayed)}
        </Text>

        <Pressable
          hitSlop={8}
          onPress={() => onDeleteSession(item)}
          className="size-10 items-center justify-center active:opacity-60"
        >
          <TrashIcon
            color={THEME[theme].destructive}
            size={16}
          />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={12}>
        <View className="flex-1">
          {!isLoading && !isError && (
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-muted-foreground">
                  {total} {total === 1 ? "session" : "sessions"}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Total playtime: {betterTimeText(totalSecs)}
                </Text>
              </View>

              {canAdd && (
                <Button
                  size="icon"
                  variant="secondary"
                  onPress={addSession}
                >
                  <PlusIcon
                    color={THEME[theme].foreground}
                    size={16}
                  />
                </Button>
              )}
            </View>
          )}

          {isLoading ? (
            <View className="flex-1 gap-2">
              {Array.from({ length: 15 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-12 rounded-xl"
                />
              ))}
            </View>
          ) : isError ? (
            <ErrorState
              refetch={refetch}
              error={error}
            />
          ) : (
            <FlashList
              data={sessions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              onRefresh={refetch}
              refreshing={isRefetching && !isFetchingNextPage}
              contentContainerClassName="pb-20"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="h-1.5" />}
              ListEmptyComponent={
                <View className="items-center rounded-2xl border border-dashed border-border py-6">
                  <Text className="font-semibold text-muted-foreground">
                    No time recorded yet!
                  </Text>
                </View>
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4">
                    <Loader />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScreenWrapper>

      <DeleteSessionSheet />

      <FormBottomSheet<CasualSessionTimeSchemaType>
        sheetRef={addTimeSheetRef}
        title="Add Time"
        description="Log a casual play session."
        submitLabel="Add Time"
        resolver={resolver}
        defaultValues={getDefaults}
        isSaving={createSession.isPending}
        onSubmit={onSubmitSession}
        onCancel={() => addTimeSheetRef.current?.dismiss()}
      >
        {(form) => (
          <TimeFields
            control={form.control}
            disabled={createSession.isPending}
          />
        )}
      </FormBottomSheet>

      <FormBottomSheet<CasualSessionTimeSchemaType>
        sheetRef={editSessionSheetRef}
        title="Edit Session"
        description="Update the date or time for this session."
        submitLabel="Save Changes"
        resolver={resolver}
        defaultValues={editInitialValues ?? getDefaults}
        isSaving={updateSession.isPending}
        onSubmit={onSubmitEditSession}
        onCancel={() => editSessionSheetRef.current?.dismiss()}
        onDismissed={() => setEditingSession(null)}
      >
        {(form) => (
          <TimeFields
            control={form.control}
            disabled={updateSession.isPending}
          />
        )}
      </FormBottomSheet>
    </View>
  );
};

export default CasualSessions;
