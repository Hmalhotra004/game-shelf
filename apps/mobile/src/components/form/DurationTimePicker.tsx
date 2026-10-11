import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { ClassValue } from "clsx";
import { cssInterop } from "nativewind";
import { Fragment } from "react";
import { View } from "react-native";

// lets className work on BottomSheetTextInput
cssInterop(BottomSheetTextInput, { className: "style" });

interface Props {
  value: number; // total seconds
  onChange: (totalSeconds: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: ClassValue;
}

type Field = "hours" | "minutes" | "seconds";

const pad = (n: number, size: number) => n.toString().padStart(size, "0");

export function DurationTimePicker({
  value,
  onChange,
  disabled,
  invalid,
  className,
}: Props) {
  const total = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const units: { field: Field; label: string; size: number; value: number }[] =
    [
      { field: "hours", label: "hr", size: 3, value: hours },
      { field: "minutes", label: "min", size: 2, value: minutes },
      { field: "seconds", label: "sec", size: 2, value: seconds },
    ];

  const update = (field: Field, raw: string) => {
    let num = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(num)) num = 0;
    num = Math.min(num, field === "hours" ? 999 : 59);

    const h = field === "hours" ? num : hours;
    const m = field === "minutes" ? num : minutes;
    const s = field === "seconds" ? num : seconds;

    onChange(h * 3600 + m * 60 + s);
  };

  return (
    <View className={cn("flex-row items-start gap-2", className)}>
      {units.map((u, i) => (
        <Fragment key={u.field}>
          {i > 0 && (
            <View className="h-12 justify-center">
              <Text className="text-lg text-muted-foreground">:</Text>
            </View>
          )}

          <View className="items-center gap-1">
            <BottomSheetTextInput
              value={pad(u.value, u.size)}
              onChangeText={(t) => update(u.field, t)}
              editable={!disabled}
              keyboardType="number-pad"
              selectTextOnFocus
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
}
