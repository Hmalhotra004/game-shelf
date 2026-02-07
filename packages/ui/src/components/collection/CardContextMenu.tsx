import { ContextMenu } from "@radix-ui/react-context-menu";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { collectionDeleteMutationOptions } from "@repo/ui/queries/collection/collection.queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2Icon, ImageIcon, TrashIcon } from "lucide-react";
import { ReactNode } from "react";
import { useConfirm } from "../../hooks/useConfirm";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";

interface Props {
  children: ReactNode;
  data: CollectionGetMany;
}

const CardContextMenu = ({ children, data }: Props) => {
  const queryClient = useQueryClient();

  const deleteGame = useMutation(
    collectionDeleteMutationOptions(data.id, queryClient),
  );

  const [ConfirmDelete, confirm] = useConfirm(
    "Delete Game",
    "This action cannot be undone",
    "destructive",
  );

  async function handleDelete() {
    const ok = await confirm();

    if (!ok) return;

    deleteGame.mutateAsync();
  }

  return (
    <>
      <ConfirmDelete />

      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
          // onClick={() => router.push(`/collection/${data.id}/edit` as Route)}
          >
            <Edit2Icon className="size-4" /> Edit
          </ContextMenuItem>

          <ContextMenuItem
          // onClick={() =>
          //   router.push(`/collection/${data.id}/change-image` as Route)
          // }
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
