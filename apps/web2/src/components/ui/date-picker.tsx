import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="justify-start font-normal"
            disabled={disabled}
          >
            {value ? value.toLocaleDateString() : "Select date"}
          </Button>
        }
      />
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
