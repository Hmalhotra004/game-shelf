import { Text } from "@/components/ui/text";
import { useConfirmSheet } from "@/hooks/useConfirmSheet";
import { api } from "@/lib/api";
import { handleError, showToast } from "@/lib/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CompletionGetMany } from "@repo/schemas/types/completion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ReactNode, useRef } from "react";
import EditCompletionSheet from "./EditCompletionSheet";

import {
  deleteCompletionMutationOptions,
  updateCompletionMutationOptions,
} from "@repo/utils/mutations/completion";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Props {
  children: ReactNode;
  completion: CompletionGetMany;
}

const CompletionCardContextMenu = ({ children, completion }: Props) => {
  const queryClient = useQueryClient();
  const editSheetRef = useRef<BottomSheetModal>(null);

  const title =
    completion.gameType === "DLC" && completion.dlcName
      ? completion.dlcName
      : completion.name;

  async function onLongPress() {
    await Haptics.selectionAsync();
  }

  const updateCompletion = useMutation(
    updateCompletionMutationOptions(
      api,
      queryClient,
      completion.id,
      (err) => handleError(err),
      () => {
        showToast("success", "Completion Updated");
        editSheetRef.current?.dismiss();
      },
    ),
  );

  const deleteCompletion = useMutation(
    deleteCompletionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        showToast("success", "Completion Deleted");
      },
    ),
  );

  const [DeleteSheet, confirmDelete] = useConfirmSheet(
    "Delete completion?",
    `This completion of "${title}" will be permanently removed. This can't be undone.`,
    "Delete",
    "destructive",
  );

  async function onDelete() {
    const ok = await confirmDelete();
    if (!ok) return;

    deleteCompletion.mutate(completion.id);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          onLongPress={onLongPress}
          asChild
        >
          {children}
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuLabel>
            <Text className="text-sm text-muted-foreground">{title}</Text>
          </ContextMenuLabel>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem onPress={() => editSheetRef.current?.present()}>
              <Text>Edit Completion</Text>
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem onPress={onDelete}>
              <Text className="text-destructive">Delete</Text>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <EditCompletionSheet
        sheetRef={editSheetRef}
        completion={completion}
        isSaving={updateCompletion.isPending}
        onSubmit={async (values) => {
          await updateCompletion.mutateAsync(values);
        }}
        onCancel={() => editSheetRef.current?.dismiss()}
      />

      <DeleteSheet />
    </>
  );
};

export default CompletionCardContextMenu;
