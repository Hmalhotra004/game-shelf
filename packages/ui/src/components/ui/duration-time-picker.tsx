"use client";

import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { ClassValue } from "clsx";

interface Props {
  value: number;
  onChange: (totalSeconds: number) => void;
  disabled: boolean;
  className?: ClassValue;
}

export function DurationTimePicker({
  value,
  onChange,
  disabled,
  className,
}: Readonly<Props>) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  const pad = (n: number, size: number) => n.toString().padStart(size, "0");

  const update = (field: "hours" | "minutes" | "seconds", raw: string) => {
    let num = Number.parseInt(raw.replaceAll(/\D/g, ""), 10);
    if (Number.isNaN(num)) num = 0;

    if (field === "hours") num = Math.min(Math.max(num, 0), 999);
    else num = Math.min(Math.max(num, 0), 59);

    let newHours = hours;
    let newMinutes = minutes;
    let newSeconds = seconds;

    if (field === "hours") newHours = num;
    if (field === "minutes") newMinutes = num;
    if (field === "seconds") newSeconds = num;

    const total = newHours * 3600 + newMinutes * 60 + newSeconds;
    onChange?.(total);
  };

  return (
    <div className={cn("flex items-center gap-2 font-mono text-lg", className)}>
      {/* Hours */}
      <Input
        className="w-16 text-center"
        value={pad(hours, 3)}
        disabled={disabled}
        inputMode="numeric"
        onChange={(e) => update("hours", e.target.value)}
      />
      :{/* Minutes */}
      <Input
        className="w-12 text-center"
        value={pad(minutes, 2)}
        disabled={disabled}
        inputMode="numeric"
        onChange={(e) => update("minutes", e.target.value)}
      />
      :{/* Seconds */}
      <Input
        className="w-12 text-center"
        value={pad(seconds, 2)}
        disabled={disabled}
        inputMode="numeric"
        onChange={(e) => update("seconds", e.target.value)}
      />
    </div>
  );
}
