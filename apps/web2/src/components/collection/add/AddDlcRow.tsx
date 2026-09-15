import { FormDatePicker, FormInput, FormSelect } from "@/components/form/Form";
import { OwnershipTypeSelect } from "@/components/form/FormSelects";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { DLCs } from "@repo/schemas/types/igdb";
import { format } from "date-fns";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

interface Props {
  dlc: DLCs;
  checked: boolean;
  onToggle: (dlc: DLCs) => void;
  fieldIndex?: number;
  control: any;
  form: UseFormReturn<any>;
  gamePurchaseDate: string;
  isPending: boolean;
}

const AddDlcRow = ({
  checked,
  control,
  dlc,
  onToggle,
  fieldIndex,
  form,
  gamePurchaseDate,
  isPending,
}: Props) => {
  const ownershipType =
    fieldIndex !== undefined
      ? form.watch(`DLCs.${fieldIndex}.ownershipType`)
      : undefined;

  const included = ownershipType === "Included";

  useEffect(() => {
    if (fieldIndex === undefined) return;

    if (included) {
      form.setValue(`DLCs.${fieldIndex}.amount`, "0");
      form.setValue(`DLCs.${fieldIndex}.dateOfPurchase`, gamePurchaseDate);
    }
  }, [included, gamePurchaseDate, fieldIndex, form]);

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
          disabled={isPending}
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
        <div className="px-3 pb-3 flex flex-col md:grid md:grid-cols-3 gap-3">
          <FormDatePicker
            control={control}
            name={`DLCs.${fieldIndex}.dateOfPurchase`}
            disabled={isPending || included}
          />
          {!included && (
            <FormInput
              control={control}
              name={`DLCs.${fieldIndex}.amount`}
              placeholder="e.g. 14.99"
              disabled={isPending || included}
            />
          )}
          <FormSelect
            name={`DLCs.${fieldIndex}.ownershipType`}
            control={control}
            disabled={isPending}
          >
            <OwnershipTypeSelect isDlc />
          </FormSelect>
        </div>
      )}
    </div>
  );
};

export default AddDlcRow;
