import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { updatePlaythroughSchema } from "@repo/schemas/server/schemas/playthrough";
import { PlaythroughStatusType as Status } from "@repo/schemas/types/index";
import { MAX_NOTES_CHARACTERS } from "@repo/utils/constants";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BackHandler,
  Keyboard,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
  status: Status;
  initialNotes: string | null;
  isSaving: boolean;
  readOnly?: boolean;
  onSave: (notes: string | null) => void;
  onCancel: () => void;
}

const NotesSheet = ({
  sheetRef,
  status,
  initialNotes,
  isSaving,
  onSave,
  onCancel,
  readOnly = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialNotes ?? "");

  const theme = useThemeStore((s) => s.theme);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // keep in sync when the saved notes change (e.g. after a successful save)
  useEffect(() => {
    setValue(initialNotes ?? "");
  }, [initialNotes]);

  // validate with the shared schema (it requires status too, so pass it along)
  const result = useMemo(
    () => updatePlaythroughSchema.safeParse({ status, notes: value }),
    [status, value],
  );

  const error = result.success
    ? null
    : (result.error.issues.find((i) => i.path[0] === "notes")?.message ??
      "Invalid notes");

  const unchanged = value.trim() === (initialNotes ?? "").trim();

  function handleSave() {
    if (!result.success) return;
    onSave(result.data.notes || null); // empty after trim => null
  }

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
        setValue(initialNotes ?? "");
      }}
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <View className="gap-1">
          <Text className="text-lg font-semibold">Notes</Text>
          <Text className="text-muted-foreground">
            {readOnly
              ? "Your notes for this playthrough."
              : "Jot down your thoughts about this playthrough."}
          </Text>
        </View>

        <View className="gap-1.5">
          <BottomSheetTextInput
            value={value}
            onChangeText={setValue}
            multiline
            autoFocus={!readOnly}
            editable={!isSaving && !readOnly}
            placeholder="Write your thoughts..."
            placeholderTextColor={THEME[theme].mutedForeground}
            textAlignVertical="top"
            style={{
              minHeight: 112,
              borderRadius: 16,
              padding: 12,
              fontSize: 14,
              color: THEME[theme].foreground,
              backgroundColor: THEME[theme].muted,
            }}
          />

          {!readOnly && (
            <View className="flex-row justify-between">
              <Text className="text-xs text-destructive">{error ?? ""}</Text>
              <Text
                className={cn(
                  "text-xs text-muted-foreground",
                  error && "text-destructive",
                )}
              >
                {value.length}/{MAX_NOTES_CHARACTERS}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={isSaving}
          >
            <Text>{readOnly ? "Close" : "Cancel"}</Text>
          </Button>

          {!readOnly && (
            <Button
              disabled={!!error || unchanged || isSaving}
              onPress={handleSave}
            >
              <Text>{isSaving ? "Saving..." : "Save"}</Text>
            </Button>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default NotesSheet;
