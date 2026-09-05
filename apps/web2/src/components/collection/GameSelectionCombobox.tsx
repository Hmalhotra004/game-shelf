import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";

interface Props {
  data: Array<{
    id: string;
    value: string;
    label: string;
    image: string | null;
  }>;
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const GameSelectionCombobox = ({ data, value, onChange, disabled }: Props) => {
  return (
    <Combobox
      items={data}
      value={value ?? ""}
      onValueChange={(val: string | null) => onChange?.(val ?? "")}
      disabled={disabled}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <ComboboxValue />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder="Search"
        />

        <ComboboxEmpty>No items found.</ComboboxEmpty>

        <ComboboxList>
          {(item: Props["data"][number]) => (
            <ComboboxItem
              key={item.id}
              value={item.value}
            >
              <div className="flex flex-row items-center gap-2">
                {item.image !== null ? (
                  <img
                    src={item.image}
                    className="size-16 rounded-md"
                  />
                ) : (
                  <ImageIcon />
                )}

                <p>{item.label}</p>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default GameSelectionCombobox;
