import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompletionGetMany } from "@repo/schemas/types/completion";
import { MAX_NOTES_CHARACTERS } from "@repo/utils/constants";
import { COMPLETION_STYLE_OPTIONS, opts } from "@repo/utils/lib/gameOptions";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BackHandler,
  Keyboard,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";

import {
  FormDatePicker,
  FormSelectSheet,
  FormTimePicker,
} from "@/components/form/form";

import {
  updateCompletionSchema,
  type UpdateCompletionSchemaType,
} from "@repo/schemas/schemas/completion";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
  completion: CompletionGetMany;
  isSaving?: boolean;
  onSubmit: (values: UpdateCompletionSchemaType) => void | Promise<void>;
  onCancel: () => void;
  onDismissed?: () => void;
}

const EditCompletionSheet = ({
  sheetRef,
  completion,
  isSaving = false,
  onSubmit,
  onCancel,
  onDismissed,
}: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);

  const title =
    completion.gameType === "DLC" && completion.dlcName
      ? completion.dlcName
      : completion.name;

  const initialValues = useMemo<UpdateCompletionSchemaType>(
    () => ({
      completionStyle: completion.completionStyle,
      totalPlaytime: completion.totalPlaytime ?? 0,
      PSVersion: completion.PSVersion ?? null,
      platform: completion.platform,
      completedAt: completion.completedAt
        ? new Date(completion.completedAt).toISOString()
        : null,
      notes: completion.notes ?? null,
    }),
    [
      completion.completionStyle,
      completion.PSVersion,
      completion.platform,
      completion.totalPlaytime,
      completion.completedAt,
      completion.notes,
    ],
  );

  const form = useForm<UpdateCompletionSchemaType>({
    resolver: zodResolver(updateCompletionSchema),
    defaultValues: initialValues,
  });

  // prefill whenever the completion being edited changes
  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form.reset]);

  // Android hardware back closes the sheet
  useEffect(() => {
    if (!isOpen) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        sheetRef.current?.dismiss();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, sheetRef]);

  // when the keyboard closes, drop back to the content-sized snap point
  useEffect(() => {
    if (!isOpen) return;

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const sub = Keyboard.addListener(hideEvent, () => {
      sheetRef.current?.snapToIndex(0);
    });

    return () => sub.remove();
  }, [isOpen, sheetRef]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ["95%"], []);

  const notes = form.watch("notes");

  const showPSVersion =
    completion.platform === "PS" &&
    (completion.gamePSVersions?.length ?? 0) > 1;

  return (
    <BottomSheetModal
      ref={sheetRef}
      stackBehavior="push"
      snapPoints={snapPoints}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.9}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      onChange={(index) => setIsOpen(index >= 0)}
      onDismiss={() => {
        setIsOpen(false);
        form.reset(initialValues);
        onDismissed?.();
      }}
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4 px-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <View className="gap-1">
          <Text className="text-lg font-semibold">Edit Completion</Text>
          <Text
            className="text-muted-foreground"
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>

        <FormSelectSheet
          name="completionStyle"
          control={form.control}
          label="Completion Style*"
          options={COMPLETION_STYLE_OPTIONS}
          disabled={isSaving}
        />

        <FormDatePicker
          name="completedAt"
          control={form.control}
          label="Completed On"
          disabled={isSaving}
        />

        {showPSVersion && (
          <FormSelectSheet
            name="PSVersion"
            control={form.control}
            label="PS Version*"
            options={opts(...completion.gamePSVersions)}
            disabled={isSaving}
          />
        )}

        <FormTimePicker
          name="totalPlaytime"
          control={form.control}
          label="Time Played*"
          disabled={isSaving}
          inBottomSheet
        />

        <Controller
          control={form.control}
          name="notes"
          render={({ field, fieldState }) => (
            <View className="gap-1.5">
              <Text className="text-sm font-medium">Notes</Text>

              <BottomSheetTextInput
                value={field.value ?? ""}
                onChangeText={(text) =>
                  field.onChange(text.length ? text : null)
                }
                onBlur={field.onBlur}
                editable={!isSaving}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Anything worth remembering..."
                placeholderTextColor={THEME[theme].mutedForeground}
                style={{
                  minHeight: 96,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: fieldState.invalid
                    ? THEME[theme].destructive
                    : THEME[theme].border,
                  backgroundColor: THEME[theme].background,
                  color: THEME[theme].foreground,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: 16,
                }}
              />

              <View className="flex-row justify-between">
                <Text className="text-xs text-destructive">
                  {fieldState.error?.message ?? ""}
                </Text>
                <Text
                  className={cn(
                    "text-xs text-muted-foreground",
                    fieldState.error && "text-destructive",
                  )}
                >
                  {notes?.length ?? 0}/{MAX_NOTES_CHARACTERS}
                </Text>
              </View>
            </View>
          )}
        />

        <View className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={isSaving}
          >
            <Text>Cancel</Text>
          </Button>

          <Button
            onPress={form.handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            <Text>{isSaving ? "Saving..." : "Save Changes"}</Text>
          </Button>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default EditCompletionSheet;
