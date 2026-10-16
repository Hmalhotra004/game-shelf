import StartPlaythroughCard from "@/components/playthrough/StartPlaythroughCard";
import { api } from "@/lib/api";
import { handleError } from "@/lib/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GameType } from "@repo/schemas/types/index";
import { GetGamesType } from "@repo/schemas/types/user";
import { startPlaythroughMutationOptions } from "@repo/utils/mutations/playthrough";
import { userGetCollectionQueryOptions } from "@repo/utils/queries/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefObject, useCallback, useState } from "react";

import SelectableListSheet, {
  SheetTab,
} from "@/components/SelectableListSheet";

interface Props {
  sheetRef: RefObject<BottomSheetModal | null>;
}

type GameItem = GetGamesType["games"][number];
type DlcItem = GetGamesType["dlcs"][number];
type ListItem = GameItem | DlcItem;

const TABS: SheetTab<GameType>[] = [
  { value: "Game", label: "Game" },
  { value: "DLC", label: "DLC" },
];

const getSearchText = (item: ListItem) => item.name;
const emptyText = (tab?: GameType) =>
  tab === "DLC" ? "No DLC found" : "No games found";

const StartPlaythroughSheet = ({ sheetRef }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery(
    userGetCollectionQueryOptions(api, isOpen),
  );

  const startPlaythrough = useMutation(
    startPlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => sheetRef.current?.dismiss(),
    ),
  );

  const getItems = useCallback(
    (tab?: GameType): ListItem[] =>
      !data ? [] : tab === "DLC" ? data.dlcs : data.games,
    [data],
  );

  const handleConfirm = async (id: string, tab?: GameType) => {
    const gameType = tab ?? "Game";
    await startPlaythrough.mutateAsync({
      gameType,
      ...(gameType === "DLC" ? { dlcId: id } : { collectionId: id }),
    });
  };

  return (
    <SelectableListSheet<ListItem, GameType>
      sheetRef={sheetRef}
      tabs={TABS}
      getItems={getItems}
      getSearchText={getSearchText}
      emptyText={emptyText}
      isLoading={isLoading}
      isError={isError}
      error={error}
      confirmLabel="Start"
      isSubmitting={startPlaythrough.isPending}
      onConfirm={handleConfirm}
      onOpenChange={setIsOpen}
      onDismiss={() => startPlaythrough.reset()}
      renderItem={({ item, selected, onPress }) => (
        <StartPlaythroughCard
          item={item}
          selected={selected}
          onPress={onPress}
        />
      )}
    />
  );
};

export default StartPlaythroughSheet;
