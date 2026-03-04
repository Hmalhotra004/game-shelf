import { zodResolver } from "@hookform/resolvers/zod";
import { GetGamesType } from "@repo/schemas/types/user";
import { FormComboBox, FormSelect } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { FieldGroup } from "@repo/ui/components/ui/field";
import ResponsiveDialog from "@repo/ui/components/ui/responsive-dialog";
import { SelectItem } from "@repo/ui/components/ui/select";
import { startPlaythroughMutationOptions } from "@repo/ui/queries/playthrough/mutations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  createPlaythroughSchema,
  CreatePlaythroughSchemaType,
} from "@repo/schemas/schemas/playthrough";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: GetGamesType;
}

const AddPlaythoughModal = ({ open, setOpen, data }: Props) => {
  const queryClient = useQueryClient();

  const startPlaythorugh = useMutation(
    startPlaythroughMutationOptions(queryClient, () => setOpen(false)),
  );

  const form = useForm<CreatePlaythroughSchemaType>({
    resolver: zodResolver(createPlaythroughSchema),
    defaultValues: {
      collectionId: undefined,
      dlcId: undefined,
      gameType: "Game",
    },
  });

  async function onSubmit(values: CreatePlaythroughSchemaType) {
    await startPlaythorugh.mutateAsync(values);
  }

  const gameType = useWatch({
    control: form.control,
    name: "gameType",
  });

  return (
    <ResponsiveDialog
      title="Add Playthough"
      description="Select a game to start a playthrough"
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FormSelect
            name="gameType"
            control={form.control}
            disabled={startPlaythorugh.isPending}
          >
            <>
              <SelectItem value="Game">Game</SelectItem>
              <SelectItem value="DLC">DLC</SelectItem>
            </>
          </FormSelect>

          {gameType === "Game" && (
            <FormComboBox
              options={data.games.map((g) => ({
                value: g.id,
                label: g.name,
                image: g.customImage ?? g.image,
              }))}
              name="collectionId"
              control={form.control}
              disabled={startPlaythorugh.isPending}
              placeholder="Select Game"
            />
          )}

          {gameType === "DLC" && (
            <FormComboBox
              options={data.dlcs.map((d) => ({
                value: d.id,
                label: d.name,
                image: d.image,
              }))}
              name="dlcId"
              control={form.control}
              disabled={startPlaythorugh.isPending}
              placeholder="Select DLC"
            />
          )}

          <div className="flex items-center justify-end gap-x-4">
            <Button
              variant="ghost"
              type="button"
              disabled={startPlaythorugh.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="secondary"
              type="submit"
              disabled={startPlaythorugh.isPending}
            >
              Start
            </Button>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
};

export default AddPlaythoughModal;
