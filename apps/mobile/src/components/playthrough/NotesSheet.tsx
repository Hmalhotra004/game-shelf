import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { PlaythroughStatusType as Status } from "@repo/schemas/types/index";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import {
  MAX_NOTES_CHARACTERS,
  updatePlaythroughSchema,
} from "@repo/schemas/server/schemas/playthrough";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

interface Props {
  status: Status;
  initialNotes: string | null;
  isSaving: boolean;
  onSave: (notes: string | null) => void;
  onCancel: () => void;
}

const NotesSheet = forwardRef<BottomSheetModal, Props>(function NotesSheet(
  { status, initialNotes, isSaving, onSave, onCancel },
  ref,
) {
  const theme = useThemeStore((s) => s.theme);
  const [value, setValue] = useState(initialNotes ?? "");

  // keep in sync when the saved notes change (e.g. after a successful save)
  useEffect(() => {
    setValue(initialNotes ?? "");
  }, [initialNotes]);

  // validate with the shared schema (status is required by it, so pass it along)
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
    // empty after trim => store null
    onSave(result.data.notes || null);
  }

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

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={() => setValue(initialNotes ?? "")}
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
    >
      <BottomSheetView className="gap-4 px-4 pb-8 pt-2">
        <View className="gap-1">
          <Text className="text-lg font-semibold">Notes</Text>
          <Text className="text-muted-foreground">
            Jot down your thoughts about this playthrough.
          </Text>
        </View>

        <View className="gap-1.5">
          <BottomSheetTextInput
            value={value}
            onChangeText={setValue}
            multiline
            autoFocus
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
        </View>

        <View className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onPress={onCancel}
          >
            <Text>Cancel</Text>
          </Button>

          <Button
            disabled={!!error || unchanged || isSaving}
            onPress={handleSave}
          >
            <Text>{isSaving ? "Saving..." : "Save"}</Text>
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default NotesSheet;
