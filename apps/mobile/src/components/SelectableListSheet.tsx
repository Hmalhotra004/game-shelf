import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { BackHandler, Pressable, Text, View } from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

import {
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface SheetTab<K extends string> {
  value: K;
  label: string;
}

interface Props<T extends { id: string }, K extends string> {
  sheetRef: RefObject<BottomSheetModal | null>;

  /** Optional tab toggle (e.g. Game / DLC). Omit for a single list. */
  tabs?: SheetTab<K>[];
  /** Returns the full (unfiltered) list for the active tab. */
  getItems: (tab: K | undefined) => T[];
  /** Text used for search matching. */
  getSearchText: (item: T) => string;
  renderItem: (args: {
    item: T;
    selected: boolean;
    onPress: (id: string) => void;
  }) => ReactElement;

  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  emptyText?: (tab: K | undefined) => string;

  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  onConfirm: (selectedId: string, tab: K | undefined) => void | Promise<void>;

  /** Fires when the sheet opens/closes — handy for enabling queries lazily. */
  onOpenChange?: (open: boolean) => void;
  /** Fires after dismiss, after internal state is reset. */
  onDismiss?: () => void;

  snapPoints?: string[];
}

function SelectableListSheet<
  T extends { id: string },
  K extends string = string,
>({
  sheetRef,
  tabs,
  getItems,
  getSearchText,
  renderItem,
  isLoading = false,
  isError = false,
  error,
  emptyText = () => "Nothing found",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isSubmitting = false,
  onConfirm,
  onOpenChange,
  onDismiss,
  snapPoints: snapPointsProp = ["91%"],
}: Props<T, K>) {
  const defaultTab = tabs?.[0]?.value;
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<K | undefined>(defaultTab);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const theme = useThemeStore((s) => s.theme);

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

  const snapPoints = useMemo(() => snapPointsProp, [snapPointsProp]);

  const items = useMemo(() => {
    const list = getItems(tab);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => getSearchText(item).toLowerCase().includes(q));
  }, [getItems, getSearchText, tab, search]);

  // Clear selection when search or tab changes
  useEffect(() => {
    setSelectedId(null);
  }, [search, tab]);

  const handlePress = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleConfirm = async () => {
    if (selectedId == null || isSubmitting) return;
    await onConfirm(selectedId, tab);
  };

  const listRenderItem = useCallback(
    ({ item }: { item: T }) =>
      renderItem({
        item,
        selected: item.id === selectedId,
        onPress: handlePress,
      }),
    [renderItem, selectedId, handlePress],
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    if (isError) {
      return (
        <Text className="mt-8 text-center text-destructive">
          {error instanceof Error ? error.message : "Something went wrong"}
        </Text>
      );
    }
    return (
      <Text className="mt-8 text-center text-muted-foreground">
        {emptyText(tab)}
      </Text>
    );
  };

  const canConfirm = selectedId != null && !isSubmitting;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(index) => {
        const open = index >= 0;
        setIsOpen(open);
        onOpenChange?.(open);
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: THEME[theme].background }}
      handleIndicatorStyle={{ backgroundColor: THEME[theme].mutedForeground }}
      onDismiss={() => {
        setIsOpen(false);
        onOpenChange?.(false);
        setSelectedId(null);
        setTab(defaultTab);
        setSearch("");
        onDismiss?.();
      }}
    >
      <View className="flex-1 px-4">
        <SearchBar
          onChangeText={setSearch}
          value={search}
        />

        {tabs && tabs.length > 1 && (
          <View className="my-3 flex-row rounded-xl bg-muted p-1">
            {tabs.map(({ value, label }) => {
              const active = tab === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setTab(value)}
                  className={cn(
                    "flex-1 items-center rounded-lg py-2",
                    active ? "bg-background" : "",
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {isLoading ? (
          <View className="gap-2 py-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-24 rounded-xl"
              />
            ))}
          </View>
        ) : (
          <BottomSheetFlatList
            data={items}
            keyExtractor={(item: T) => item.id}
            renderItem={listRenderItem}
            ListEmptyComponent={renderEmpty}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}

        <View className="flex-row gap-3 pb-6 pt-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
            onPress={() => sheetRef.current?.dismiss()}
          >
            <Text className="font-medium text-foreground">{cancelLabel}</Text>
          </Button>

          <Button
            className="flex-1"
            disabled={!canConfirm}
            onPress={handleConfirm}
          >
            {isSubmitting ? (
              <Loader color={THEME[theme].background} />
            ) : (
              <Text className="font-medium text-primary-foreground">
                {confirmLabel}
              </Text>
            )}
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

export default SelectableListSheet;
