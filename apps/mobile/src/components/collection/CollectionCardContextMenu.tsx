import { Text } from "@/components/ui/text";
import { useConfirmSheet } from "@/hooks/useConfirmSheet";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ReactNode } from "react";

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
  game: CollectionGetMany;
}

const CollectionCardContextMenu = ({ children, game }: Props) => {
  const router = useRouter();

  async function onLongPress() {
    await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press);
  }

  const [ArchiveSheet, confirmArchive] = useConfirmSheet(
    "Archive game?",
    `"${game.name}" will be moved to your archive. You can restore it later.`,
    "Archive",
    "default",
  );

  const [DeleteSheet, confirmDelete] = useConfirmSheet(
    "Delete game?",
    `"${game.name}" will be permanently removed from your collection. This can't be undone.`,
    "Delete",
    "destructive",
  );

  async function onArchive() {
    const ok = await confirmArchive();
    if (!ok) return;
    // TODO: archive mutation, e.g. archiveMutation.mutate({ id: game.id })
  }

  async function onDelete() {
    const ok = await confirmDelete();
    if (!ok) return;
    // TODO: delete mutation, e.g. deleteMutation.mutate({ id: game.id })
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger onLongPress={onLongPress}>
          {children}
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuLabel>
            <Text className="text-sm text-muted-foreground">{game.name}</Text>
          </ContextMenuLabel>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem
              onPress={() =>
                router.push({
                  pathname: "/(collection)/[collectionId]/edit",
                  params: { collectionId: game.id },
                })
              }
            >
              <Text>Edit Collection</Text>
            </ContextMenuItem>

            <ContextMenuItem
              onPress={() =>
                router.push({
                  pathname: "/(collection)/[collectionId]/manage-dlcs",
                  params: { collectionId: game.id },
                })
              }
            >
              <Text>Manage DLCs</Text>
            </ContextMenuItem>

            <ContextMenuItem
              onPress={() =>
                router.push({
                  pathname: "/(collection)/[collectionId]/manage-micro",
                  params: { collectionId: game.id },
                })
              }
            >
              <Text>Manage Microtransactions</Text>
            </ContextMenuItem>

            <ContextMenuItem
              onPress={() =>
                router.push({
                  pathname: "/(collection)/[collectionId]/edit-images",
                  params: { collectionId: game.id },
                })
              }
            >
              <Text>Change Images</Text>
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem onPress={onArchive}>
              <Text>Archive</Text>
            </ContextMenuItem>

            <ContextMenuItem onPress={onDelete}>
              <Text className="text-destructive">Delete</Text>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <ArchiveSheet />
      <DeleteSheet />
    </>
  );
};

export default CollectionCardContextMenu;
