import { ContextMenu } from "@radix-ui/react-context-menu";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { api } from "@repo/ui/lib/api";
import { showError } from "@repo/ui/lib/utils";
import { CollectionQueryKeys } from "@repo/ui/queries/collection/collection.keys";
import { StatsQueryKeys } from "@repo/ui/queries/stats/stats.keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2Icon, ImageIcon, TrashIcon } from "lucide-react";
import { ReactNode } from "react";
import { toast } from "sonner";
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
  onEdit?: (game: CollectionGetMany) => void;
  onChangeImages?: (game: CollectionGetMany) => void;
}

const CardContextMenu = ({ children, data, onChangeImages, onEdit }: Props) => {
  const queryClient = useQueryClient();

  const deleteGame = useMutation({
    mutationFn: async () => {
      await api.delete(`/collection/${data.id}/delete`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CollectionQueryKeys.getMany(),
      });
      await queryClient.invalidateQueries({
        queryKey: StatsQueryKeys.getStats(),
      });

      toast.success("Game deleted successfully");
    },
    onError: (e) => showError(e),
  });

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
          <ContextMenuItem onClick={() => onEdit?.(data)}>
            <Edit2Icon className="size-4" /> Edit
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onChangeImages?.(data)}>
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
