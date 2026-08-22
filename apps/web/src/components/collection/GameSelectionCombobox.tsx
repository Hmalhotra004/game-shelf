import { ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
}

const GameSelectionCombobox = ({ data }: Props) => {
  return (
    <Combobox
      items={data}
      defaultValue={data[0]}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
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
