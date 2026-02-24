import { PlaythroughStatusType } from "@repo/schemas/types/index";
import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";
import { Button } from "@repo/ui/components/ui/button";
import ResponsiveDialog from "@repo/ui/components/ui/responsive-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, ReactNode, SetStateAction } from "react";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  playthrough: PlaythroughGetManyType;
  status: PlaythroughStatusType;
}

const UpdatePlaythroughModal = ({
  open,
  setOpen,
  playthrough,
  status,
}: Props) => {
  const queryClient = useQueryClient();

  const updatePlay = useMutation({});

  // const updatePlay = useMutation(
  //   trpc.playthrough.updatePlaythroughStatus.mutationOptions({
  //     onSuccess: async () => {
  //       await queryClient.invalidateQueries(
  //         trpc.playthrough.getMany.queryOptions(),
  //       );
  //       await queryClient.invalidateQueries(trpc.stats.getStats.queryOptions());
  //       toast.success("Playthrough Updated");
  //       setOpen(false);
  //     },
  //     onError: (err) => {
  //       toast.error(err.message);
  //     },
  //   }),
  // );

  const isPending = updatePlay.isPending;

  function getDescription() {
    switch (status) {
      case "Active":
        return "Resume Playthrough";
      case "Archived":
        return "Archive this playthrough";
      case "On Hold":
        return "Put playthrough on hold";
    }
  }

  function getText(): ReactNode {
    const name = <span className="font-semibold">{playthrough.name}</span>;
    const className = "text-sm text-foreground font-light tracking-wide";

    switch (status) {
      case "Active":
        return <p className={className}>This will resume {name}.</p>;

      case "Archived":
        return <p className={className}>This will archive {name}.</p>;

      case "On Hold":
        return <p className={className}>This will put {name} on hold.</p>;
    }
  }

  return (
    <ResponsiveDialog
      title="Update Playthough"
      description={getDescription()}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-y-4">
        {getText()}

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
            disabled={isPending}
            // onClick={() =>
            //   updatePlay.mutateAsync({ playthroughId: playthrough.id, status })
            // }
          >
            Update
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};

export default UpdatePlaythroughModal;
