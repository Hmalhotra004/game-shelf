import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "@repo/schemas/types/playthrough";
import { FormDatePicker, FormTimePicker } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { FieldGroup } from "@repo/ui/components/ui/field";
import ResponsiveDialog from "@repo/ui/components/ui/responsive-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

import {
  updatePlaythroughSessionSchema,
  UpdatePlaythroughSessionSchemaType,
} from "@repo/schemas/schemas/playthrough";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  session: Session;
}

const UpdateSessionModal = ({ open, setOpen, session }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<UpdatePlaythroughSessionSchemaType>({
    resolver: zodResolver(updatePlaythroughSessionSchema),
    defaultValues: {
      playDate: new Date(session.playDate),
      secondsPlayed: session.duration,
    },
  });

  const updateSession = useMutation({});

  // const updateSession = useMutation(
  //   trpc.playthrough.updatePlaythroughTime.mutationOptions({
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries(
  //         trpc.playthrough.getMany.queryOptions()
  //       );
  //       await queryClient.invalidateQueries(trpc.stats.getStats.queryOptions());
  //       toast.success("Session Updated");
  //       setOpen(false);
  //     },
  //     onError: (err) => {
  //       toast.error(err.message);
  //     },
  //   })
  // );

  function onSubmit(values: UpdatePlaythroughSessionSchemaType) {
    // updateSession.mutateAsync({
    //   ...values,
    //   playthroughSessionId: session.id,
    //   playthroughId: session.playthroughId,
    // });
  }

  const isPending = updateSession.isPending;

  return (
    <ResponsiveDialog
      title="Edit Playthough"
      description="You can edit your recorded time"
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FormDatePicker
            control={form.control}
            name="playDate"
            disabled={isPending}
            label="Date"
          />

          <FormTimePicker
            control={form.control}
            name="secondsPlayed"
            disabled={isPending}
            label="Time Played"
          />

          <div className="flex items-center justify-end gap-x-4">
            <Button
              variant="ghost"
              type="button"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={isPending}
            >
              Update
            </Button>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
};

export default UpdateSessionModal;
