import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { Option } from "@repo/utils/lib/gameOptions";
import { CheckIcon } from "lucide-react-native";
import { RefObject, useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, useWindowDimensions } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetFlashList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

interface Props<T extends string> {
  title: string;
  options: Option<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  sheetRef: RefObject<BottomSheetModal | null>;
}

function SelectValueBottomSheet<T extends string>({
  sheetRef,
  onChange,
  value,
  options,
  title,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const theme = useThemeStore((s) => s.theme);
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Option<T> }) => {
      const isSelected = value === item.value;

      return (
        <Pressable
          onPress={() => {
            onChange(item.value);
            sheetRef.current?.dismiss();
          }}
          className="flex-row items-center justify-between py-3 border-b border-border active:opacity-70"
        >
          <Text>{item.label}</Text>
          {isSelected && (
            <CheckIcon
              size={16}
              color={THEME[theme].foreground}
            />
          )}
        </Pressable>
      );
    },
    [value, theme, onChange, sheetRef],
  );

  const ListHeader = useCallback(
    () => (
      <Text className="text-muted-foreground text-lg font-semibold mb-1">
        {title}
      </Text>
    ),
    [title],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      maxDynamicContentSize={MAX_SHEET_HEIGHT}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(index) => setIsOpen(index >= 0)}
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
    >
      <BottomSheetFlashList
        data={options}
        keyExtractor={(item) => item.value}
        renderItem={renderItem}
        estimatedItemSize={50}
        ListHeaderComponent={ListHeader}
        style={{ maxHeight: MAX_SHEET_HEIGHT }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
}

export default SelectValueBottomSheet;
