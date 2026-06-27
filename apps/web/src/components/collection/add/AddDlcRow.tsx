import { format } from "date-fns";

import type { DLCs } from "@repo/schemas/types/igdb";

import { FormDatePicker, FormInput, FormSelect } from "@/components/form/Form";
import { OwnershipTypeSelect } from "@/components/form/FormSelects";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Props {
  dlc: DLCs;
  checked: boolean;
  onToggle: (dlc: DLCs) => void;
  fieldIndex?: number;
  control: any;
}

const AddDlcRow = ({ checked, control, dlc, onToggle, fieldIndex }: Props) => {
  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-transparent",
      )}
    >
      {/* Always-visible row */}
      <label className="flex items-center gap-3 p-3 cursor-pointer select-none">
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle(dlc)}
          className="shrink-0"
        />

        <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
          {dlc.image ? (
            <img
              src={dlc.image}
              alt={dlc.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{dlc.name}</p>
          {dlc.releaseDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(dlc.releaseDate, "PPP")}
            </p>
          )}
        </div>
      </label>

      {/* Expanded purchase inputs — only when checked */}
      {checked && fieldIndex !== undefined && (
        <div className="px-3 pb-3 grid grid-cols-3 gap-3">
          <FormDatePicker
            control={control}
            name={`DLCs.${fieldIndex}.dateOfPurchase`}
            disabled={false}
          />
          <FormInput
            control={control}
            name={`DLCs.${fieldIndex}.amount`}
            placeholder="e.g. 14.99"
            disabled={false}
          />
          <FormSelect
            name={`DLCs.${fieldIndex}.ownershipType`}
            control={control}
            disabled={false}
          >
            <OwnershipTypeSelect />
          </FormSelect>
        </div>
      )}
    </div>
  );
};

export default AddDlcRow;
