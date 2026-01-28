"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";

export type OptionType = {
  value: string;
  label: string;
  image: string | null;
};

interface Props {
  options: OptionType[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled: boolean;
}

export function Combobox({
  options,
  placeholder,
  onChange,
  value,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((op) => op.value === value);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        asChild
        disabled={disabled}
        className="h-fit py-2"
      >
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
          className={cn(
            "justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2">
              <img
                src={selectedOption.image!}
                alt="image"
                width={50}
                height={50}
                className="rounded-md"
              />
              {selectedOption.label}
            </div>
          ) : (
            `Select ${placeholder}...`
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}`} />
          <CommandList>
            <CommandEmpty>No {placeholder?.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <img
                    src={option.image!}
                    alt="image"
                    width={50}
                    height={50}
                    className="rounded-md"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
