import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { CheckIcon } from "lucide-react-native";
import { RefObject, useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, useWindowDimensions } from "react-native";
import type { Option } from "./SelectValueBottomSheet";

import {
  BottomSheetBackdrop,
  BottomSheetFlashList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

interface Props {
  title: string;
  options: Option[];
  value: string[] | null | undefined;
  onChange: (value: string[]) => void;
  sheetRef: RefObject<BottomSheetModal | null>;
}

const MultiSelectBottomSheet = ({
  title,
  options,
  value,
  onChange,
  sheetRef,
}: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const [isOpen, setIsOpen] = useState(false);
  const { height } = useWindowDimensions();
  const MAX_SHEET_HEIGHT = height * 0.85;
  const selected = value ?? [];

  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      sheetRef.current?.dismiss();
      return true;
    });
    return () => sub.remove();
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

  const toggle = useCallback(
    (v: string) =>
      onChange(
        selected.includes(v)
          ? selected.filter((x) => x !== v)
          : [...selected, v],
      ),
    [selected, onChange],
  );

  const renderItem = useCallback(
    ({ item }: { item: Option }) => (
      <Pressable
        onPress={() => toggle(item.value)}
        className="flex-row items-center justify-between py-3 border-b border-border active:opacity-70"
      >
        <Text>{item.label}</Text>
        {selected.includes(item.value) && (
          <CheckIcon
            size={16}
            color={THEME[theme].foreground}
          />
        )}
      </Pressable>
    ),
    [selected, toggle, theme],
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
        extraData={selected}
        keyExtractor={(item) => item.value}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text className="text-muted-foreground text-lg font-semibold mb-1">
            {title}
          </Text>
        }
        style={{ maxHeight: MAX_SHEET_HEIGHT }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
};

export default MultiSelectBottomSheet;
