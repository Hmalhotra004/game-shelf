import { ContextMenu } from "@radix-ui/react-context-menu";
import { CollectionGetManyItem } from "@repo/schemas/types/collection";
import { useConfirm } from "@repo/ui/hooks/useConfirm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2Icon, ImageIcon, TrashIcon } from "lucide-react";
import { ReactNode } from "react";
import { toast } from "sonner";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";

interface Props {
  children: ReactNode;
  data: CollectionGetManyItem;
}

const CardContextMenu = ({ children, data }: Props) => {
  const queryClient = useQueryClient();

  const deleteGame = useMutation(
    trpc.collection.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.collection.getMany.queryOptions(),
        );
        await queryClient.invalidateQueries(trpc.stats.getStats.queryOptions());

        toast.success("Game deleted successfully");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const [ConfirmDelete, confirm] = useConfirm(
    "Delete Game",
    "This action cannot be undone",
    "destructive",
  );

  async function handleDelete() {
    const ok = await confirm();

    if (!ok) return;

    deleteGame.mutateAsync({ collectionId: data.id });
  }

  return (
    <>
      <ConfirmDelete />

      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => router.push(`/collection/${data.id}/edit` as Route)}
          >
            <Edit2Icon className="size-4" /> Edit
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() =>
              router.push(`/collection/${data.id}/change-image` as Route)
            }
          >
            <ImageIcon className="size-4" /> Change Images
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={handleDelete}
            className="text-rose-500 focus:text-rose-700"
          >
            <TrashIcon className="size-4 text-rose-500" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};

export default CardContextMenu;
