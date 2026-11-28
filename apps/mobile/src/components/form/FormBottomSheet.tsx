import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DefaultValues,
  FieldValues,
  Resolver,
  useForm,
  UseFormReturn,
} from "react-hook-form";

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
} from "@gorhom/bottom-sheet";

/**
 * TFieldValues - the form's input shape (what the fields hold)
 * TSubmitValues - the shape handed to `onSubmit` (the schema's output; equals
 *                 TFieldValues unless the schema transforms/coerces values)
 */
type FormBottomSheetProps<
  TFieldValues extends FieldValues,
  TSubmitValues extends FieldValues = TFieldValues,
> = {
  sheetRef: RefObject<BottomSheetModal | null>;
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  savingLabel?: string;
  isSaving?: boolean;

  /** e.g. `zodResolver(schema)` */
  resolver: Resolver<TFieldValues, any, TSubmitValues>;

  /**
   * Values the form is (re)set to when this changes and when the sheet is
   * dismissed. Pass a function for values that must be fresh on every reset
   * (e.g. "now"). Object values must be referentially stable (useMemo / module
   * constant), otherwise the form resets on every render.
   */
  defaultValues: DefaultValues<TFieldValues> | (() => DefaultValues<TFieldValues>);

  /** Render the fields; `form` is fully typed to this sheet's form. */
  children: (
    form: UseFormReturn<TFieldValues, any, TSubmitValues>,
  ) => ReactNode;

  onSubmit: (values: TSubmitValues) => void | Promise<void>;
  onCancel: () => void;
  onDismissed?: () => void;
};

function resolveDefaults<TFieldValues extends FieldValues>(
  defaults: DefaultValues<TFieldValues> | (() => DefaultValues<TFieldValues>),
): DefaultValues<TFieldValues> {
  return typeof defaults === "function"
    ? (defaults as () => DefaultValues<TFieldValues>)()
    : defaults;
}

function FormBottomSheet<
  TFieldValues extends FieldValues,
  TSubmitValues extends FieldValues = TFieldValues,
>({
  sheetRef,
  title,
  description,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  savingLabel = "Saving...",
  isSaving = false,
  resolver,
  defaultValues,
  children,
  onSubmit,
  onCancel,
  onDismissed,
}: FormBottomSheetProps<TFieldValues, TSubmitValues>) {
  const theme = useThemeStore((s) => s.theme);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<TFieldValues, any, TSubmitValues>({
    resolver,
    defaultValues: resolveDefaults(defaultValues),
  });
  const { reset } = form;

  // prefill whenever the default values change (e.g. a different row is edited)
  useEffect(() => {
    reset(resolveDefaults(defaultValues));
  }, [defaultValues, reset]);

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
        reset(resolveDefaults(defaultValues));
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
          <Text className="text-lg font-semibold">{title}</Text>
          {!!description && (
            <Text className="text-muted-foreground">{description}</Text>
          )}
        </View>

        {children(form)}

        <View className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={isSaving}
          >
            <Text>{cancelLabel}</Text>
          </Button>

          <Button
            onPress={() => form.handleSubmit(onSubmit)()}
            disabled={isSaving}
          >
            <Text>{isSaving ? savingLabel : submitLabel}</Text>
          </Button>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export type { FormBottomSheetProps };
export default FormBottomSheet;