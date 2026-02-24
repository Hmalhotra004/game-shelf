import { zodResolver } from "@hookform/resolvers/zod";
import { createPlaythroughSessionSchema } from "@repo/schemas/schemas/playthrough";
import { FormDatePicker, FormTimePicker } from "@repo/ui/components/form/Form";
import { Button } from "@repo/ui/components/ui/button";
import { FieldGroup } from "@repo/ui/components/ui/field";
import ResponsiveDialog from "@repo/ui/components/ui/responsive-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  playthroughId: string;
}

type FormData = z.infer<typeof createPlaythroughSessionSchema>;

const AddSessionModal = ({ open, setOpen, playthroughId }: Props) => {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(createPlaythroughSessionSchema),
    defaultValues: {
      playDate: new Date(),
      secondsPlayed: 0,
    },
  });

  const addSession = useMutation({});

  // const addSession = useMutation(
  //   trpc.playthrough.addPlaythroughTime.mutationOptions({
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries(
  //         trpc.playthrough.getMany.queryOptions(),
  //       );
  //       toast.success("Session Added");
  //       setOpen(false);
  //     },
  //     onError: (err) => {
  //       toast.error(err.message);
  //     },
  //   }),
  // );

  function onSubmit(values: FormData) {
    // addSession.mutateAsync({ ...values, playthroughId });
  }

  const isPending = addSession.isPending;

  return (
    <ResponsiveDialog
      title="Add Time"
      description="Add Time played to have it recorded"
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
              Add
            </Button>
          </div>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
};

export default AddSessionModal;
