import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";
import { cssInterop } from "nativewind";
import { Fragment, memo } from "react";
import { TextInput, View } from "react-native";

import {
  BottomSheetTextInput,
  useBottomSheetInternal,
} from "@gorhom/bottom-sheet";

// lets className work on BottomSheetTextInput (plain TextInput already supports it)
cssInterop(BottomSheetTextInput, { className: "style" });

interface Props {
  value: number; // total seconds
  onChange: (totalSeconds: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: ClassValue;
  /**
   * Force the input flavour. By default it is auto-detected: inside a
   * BottomSheet it uses BottomSheetTextInput (keyboard-aware), anywhere else
   * it uses a regular TextInput.
   */
  inBottomSheet?: boolean;
}

type Field = "hours" | "minutes" | "seconds";

const pad = (n: number, size: number) => n.toString().padStart(size, "0");

const UNITS: { field: Field; label: string; size: number; max: number }[] = [
  { field: "hours", label: "hr", size: 3, max: 999 },
  { field: "minutes", label: "min", size: 2, max: 59 },
  { field: "seconds", label: "sec", size: 2, max: 59 },
];

export const DurationTimePicker = memo(function DurationTimePicker({
  value,
  onChange,
  disabled,
  invalid,
  className,
  inBottomSheet,
}: Props) {
  // returns null (instead of throwing) when rendered outside a bottom sheet
  const sheetContext = useBottomSheetInternal(true);
  const useSheetInput = inBottomSheet ?? !!sheetContext;
  const Input = useSheetInput ? BottomSheetTextInput : TextInput;

  const total = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const parts: Record<Field, number> = {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };

  const update = (field: Field, max: number, raw: string) => {
    let num = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(num)) num = 0;
    num = Math.min(num, max);

    const next = { ...parts, [field]: num };
    onChange(next.hours * 3600 + next.minutes * 60 + next.seconds);
  };

  return (
    <View className={cn("flex-row items-start gap-2", className)}>
      {UNITS.map((u, i) => (
        <Fragment key={u.field}>
          {i > 0 && (
            <View className="h-12 justify-center">
              <Text className="text-lg text-muted-foreground">:</Text>
            </View>
          )}

          <View className="items-center gap-1">
            <Input
              value={pad(parts[u.field], u.size)}
              onChangeText={(t) => update(u.field, u.max, t)}
              editable={!disabled}
              keyboardType="number-pad"
              returnKeyType="done"
              selectTextOnFocus
              accessibilityLabel={u.label}
              className={cn(
                "h-12 rounded-md border bg-card text-center text-lg text-foreground",
                u.field === "hours" ? "w-20" : "w-16",
                invalid ? "border-destructive" : "border-border",
                disabled && "opacity-50",
              )}
            />
            <Text className="text-xs text-muted-foreground">{u.label}</Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
});

export default DurationTimePicker;
