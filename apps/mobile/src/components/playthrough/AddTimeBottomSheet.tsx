import { FormDatePicker, FormTimePicker } from "@/components/form/form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BackHandler,
  Keyboard,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";

import {
  createPlaythroughSessionSchema,
  type CreatePlaythroughSessionSchemaType,
} from "@repo/schemas/server/schemas/playthrough";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
  isSaving?: boolean;
  onSubmit: (values: CreatePlaythroughSessionSchemaType) => void;
  onCancel: () => void;
}

// today's date (with the current time) and no time played yet
const getDefaults = (): CreatePlaythroughSessionSchemaType => ({
  playDate: new Date().toISOString(),
  secondsPlayed: 0,
});

const AddTimeBottomSheet = ({
  sheetRef,
  isSaving = false,
  onSubmit,
  onCancel,
}: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CreatePlaythroughSessionSchemaType>({
    resolver: zodResolver(createPlaythroughSessionSchema),
    defaultValues: getDefaults(),
  });

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

  // index 0 = content height (capped at 90%), index 1 = 95% (keyboard open)
  const snapPoints = useMemo(() => ["95%"], []);

  return (
    <BottomSheetModal
      ref={sheetRef}
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
        form.reset(getDefaults());
      }}
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4 px-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="gap-1">
          <Text className="text-lg font-semibold">Add Time</Text>
          <Text className="text-muted-foreground">
            Log a play session for this playthrough.
          </Text>
        </View>

        <FormDatePicker
          control={form.control}
          name="playDate"
          label="Date"
          disabled={isSaving}
        />

        <FormTimePicker
          control={form.control}
          name="secondsPlayed"
          label="Time played"
          disabled={isSaving}
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
            <Text>{isSaving ? "Adding..." : "Add Time"}</Text>
          </Button>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default AddTimeBottomSheet;
