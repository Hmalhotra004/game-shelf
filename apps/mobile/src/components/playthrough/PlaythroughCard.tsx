import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useConfirmSheet } from "@/hooks/useConfirmSheet";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn, handleError, showToast } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CreatePlaythroughSessionSchemaType } from "@repo/schemas/schemas/playthrough";
import { PlaythroughStatusType as Status } from "@repo/schemas/types/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import ActionButton from "./ActionButton";
import AddTimeBottomSheet from "./AddTimeBottomSheet";
import NotesSheet from "./NotesSheet";
import StatTile from "./StatTile";

import {
  betterTimeText,
  playStatusAction,
  PLAYTHROUGH_STATUS_STYLE,
  secondsToHMS,
} from "@repo/utils/lib/utils";

import {
  addPlaythroughSessionMutationOptions,
  deletePlaythroughMutationOptions,
  updatePlaythroughMutationOptions,
} from "@repo/utils/mutations/playthrough";

import {
  PlaythroughGetManyType,
  Session as SessionType,
} from "@repo/schemas/types/playthrough";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CalendarIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  ImageIcon,
  ListIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  StickyNoteIcon,
  TrashIcon,
} from "lucide-react-native";

interface Props {
  play: PlaythroughGetManyType;
}

const HERO_HEIGHT = 128;
const SESSION_ROW_HEIGHT = 48;
const SESSION_GAP = 6;
const VISIBLE_SESSIONS = 5;
const SESSIONS_MAX_HEIGHT =
  VISIBLE_SESSIONS * SESSION_ROW_HEIGHT + (VISIBLE_SESSIONS - 1) * SESSION_GAP;

const PlaythroughCard = ({ play }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const router = useRouter();
  const queryClient = useQueryClient();

  const notesSheetRef = useRef<BottomSheetModal>(null);
  const addTimeSheetRef = useRef<BottomSheetModal>(null);

  const imageUri = play.customCoverImage ?? play.coverImage;
  const isArchived = play.status === "Archived";
  const isOnHold = play.status === "On Hold";
  const statusStyle =
    PLAYTHROUGH_STATUS_STYLE[play.status] ?? PLAYTHROUGH_STATUS_STYLE.Active;
  const mutedColor = THEME[theme].mutedForeground;
  const fgColor = THEME[theme].foreground;

  // Newest first
  const sessions = useMemo(
    () =>
      [...play.sessions].sort(
        (a, b) =>
          new Date(b.playDate).getTime() - new Date(a.playDate).getTime(),
      ),
    [play.sessions],
  );
  const lastPlayed = sessions[0] ? formatDate(sessions[0].playDate, "PP") : "—";

  // ----------------- Mutations -------------------------------

  const createSession = useMutation(
    addPlaythroughSessionMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {
        addTimeSheetRef.current?.dismiss();
        showToast("success", "Session Added");
      },
    ),
  );

  const updatePlaythrough = useMutation(
    updatePlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => showToast("success", "Updated"),
    ),
  );

  const updateSession = useMutation({});

  const deletePlay = useMutation(
    deletePlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => showToast("success", "Deleted"),
    ),
  );

  const deleteSession = useMutation({});

  // ----------------- Sheets -------------------------------
  const [DeletePlaySheet, confirmDeletePlay] = useConfirmSheet(
    "Delete Playthrough",
    "This will permanently delete this playthrough and all of its sessions. This can't be undone.",
    "Delete",
    "destructive",
  );

  const [DeleteSessionSheet, confirmDeleteSession] = useConfirmSheet(
    "Delete Session",
    "This session will be permanently removed from this playthrough. This can't be undone.",
    "Delete",
    "destructive",
  );

  const [StatusSheet, confirmStatus] = useConfirmSheet(
    "Update Status",
    "",
    "Confirm",
  );

  // ----------------- Functions -------------------------------
  async function onDeletePlay() {
    const ok = await confirmDeletePlay();
    if (!ok) return;

    deletePlay.mutate(play.id);
  }

  async function onDeleteSession(s: SessionType) {
    const ok = await confirmDeleteSession();
    if (!ok) return;

    // deleteSession.mutate(s.id);
  }

  async function onChangeStatus(status: Status) {
    const action = playStatusAction(play.status, status);

    const ok = await confirmStatus({
      title: `${action} Playthrough`,
      message: `Status will change from "${play.status}" to "${status}".`,
      confirmText: action,
    });
    if (!ok) return;

    updatePlaythrough.mutate({
      id: play.id,
      status,
      notes: play.notes ?? null,
    });
  }

  function openNotes() {
    notesSheetRef.current?.present();
  }

  function onSaveNotes(notes: string | null) {
    updatePlaythrough.mutate(
      { id: play.id, status: play.status, notes },
      { onSuccess: () => notesSheetRef.current?.dismiss() },
    );
  }

  function addSession() {
    addTimeSheetRef.current?.present();
  }

  async function onSubmitSession(values: CreatePlaythroughSessionSchemaType) {
    await createSession.mutateAsync({ id: play.id, ...values });
  }

  function editSession(s: SessionType) {}

  function finish() {
    router.push({
      pathname: "/(playthrough)/[playthroughId]/finish",
      params: { playthroughId: play.id },
    });
  }

  return (
    <>
      <View
        className="overflow-hidden rounded-3xl border border-border bg-card"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        {/* Hero */}
        <View style={{ height: HERO_HEIGHT }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: HERO_HEIGHT }}
              contentFit="cover"
              transition={250}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-muted">
              <ImageIcon
                color={mutedColor}
                size={40}
              />
            </View>
          )}

          {imageUri && (
            <View
              pointerEvents="none"
              className="absolute inset-0 bg-black/75"
            />
          )}

          {/* Status */}
          <View className="absolute left-3 top-3">
            <Badge
              variant="outline"
              className={cn(statusStyle.bg, statusStyle.border)}
            >
              <Text className={cn("text-2xs font-semibold")}>
                {play.status}
              </Text>
            </Badge>
          </View>

          {/* Title + meta */}
          <View className="absolute inset-x-3 bottom-3 gap-1">
            <Text
              className={cn("text-xl font-bold leading-tight")}
              numberOfLines={2}
            >
              {play.name}
            </Text>
            <Text className={cn("text-xs font-medium text-muted-foreground")}>
              {play.platform === "PS" ? "PlayStation" : play.platform} ·{" "}
              {play.provider} {play.gameType === "DLC" && "· DLC"}
            </Text>
          </View>
        </View>

        {/* Status accent line */}
        <View className={cn("h-1", statusStyle.bar)} />

        <View className="gap-4 p-4">
          {/* Stats */}
          <View className="flex-row gap-2">
            <StatTile
              icon={ClockIcon}
              label="Played"
              value={
                play.totalSeconds > 0
                  ? betterTimeText(play.totalSeconds)
                  : "0h 0m"
              }
              color={mutedColor}
            />
            <StatTile
              icon={ListIcon}
              label="Sessions"
              value={String(play.sessions.length)}
              color={mutedColor}
            />
            <StatTile
              icon={CalendarIcon}
              label="Last played"
              value={lastPlayed}
              color={mutedColor}
            />
          </View>

          {/* Sessions */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sessions
              </Text>
              {!isArchived && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-0 w-5 p-2"
                  onPress={addSession}
                >
                  <PlusIcon
                    color={THEME[theme].foreground}
                    size={14}
                  />
                </Button>
              )}
            </View>

            {sessions.length === 0 ? (
              <View className="items-center rounded-2xl border border-dashed border-border py-6">
                <Text className="font-semibold text-muted-foreground">
                  No time recorded yet!
                </Text>
              </View>
            ) : (
              <>
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={
                    sessions.length > VISIBLE_SESSIONS
                  }
                  style={{ maxHeight: SESSIONS_MAX_HEIGHT }}
                  contentContainerStyle={{ gap: SESSION_GAP }}
                >
                  {sessions.map((s) => (
                    <Pressable
                      key={s.id}
                      disabled={isArchived}
                      onPress={() => {}}
                      className="flex-row items-center justify-between rounded-xl bg-muted pl-3.5 pr-1 active:opacity-70"
                      style={{ height: SESSION_ROW_HEIGHT }}
                    >
                      <Text className="text-sm">
                        {formatDate(s.playDate, "PP")}
                      </Text>

                      <View className="flex-row items-center">
                        <Text className="text-sm font-semibold">
                          {secondsToHMS(s.duration)}
                        </Text>

                        {!isArchived && (
                          <View className="size-10 items-center justify-center">
                            <EllipsisVerticalIcon
                              color={mutedColor}
                              size={18}
                            />
                          </View>
                        )}

                        {isArchived && <View className="w-3" />}
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>

                {sessions.length > VISIBLE_SESSIONS && (
                  <Text className="text-center text-2xs text-muted-foreground">
                    Scroll to see all {sessions.length} sessions
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Notes */}
          {!!play.notes && (
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </Text>

              <Button
                variant="secondary"
                disabled={isArchived}
                onPress={openNotes}
                className="text-start items-center justify-start h-auto"
              >
                <Text className="text-sm text-muted-foreground">
                  {play.notes}
                </Text>
              </Button>
            </View>
          )}

          {/* Quick actions */}
          <View className="flex-row justify-between border-t border-border pt-3">
            {!isArchived && (
              <ActionButton
                icon={isOnHold ? PlayIcon : PauseIcon}
                label={isOnHold ? "Resume" : "Pause"}
                color={fgColor}
                onPress={() => onChangeStatus(isOnHold ? "Active" : "On Hold")}
              />
            )}

            {!isArchived && (
              <ActionButton
                icon={StickyNoteIcon}
                label="Notes"
                color={fgColor}
                onPress={openNotes}
              />
            )}

            <ActionButton
              icon={isArchived ? ArchiveRestoreIcon : ArchiveIcon}
              label={isArchived ? "Restore" : "Archive"}
              color={fgColor}
              onPress={() => onChangeStatus(isArchived ? "Active" : "Archived")}
            />

            <ActionButton
              icon={TrashIcon}
              label="Delete"
              color={THEME[theme].destructive}
              onPress={onDeletePlay}
            />
          </View>

          {!isArchived && (
            <Button
              variant="secondary"
              onPress={finish}
            >
              <FlagIcon
                color={fgColor}
                size={16}
              />
              <Text className="text-sm font-semibold">Finish Playthrough</Text>
            </Button>
          )}
        </View>
      </View>

      <StatusSheet />
      <DeletePlaySheet />
      <DeleteSessionSheet />

      <NotesSheet
        sheetRef={notesSheetRef}
        status={play.status}
        initialNotes={play.notes ?? null}
        isSaving={updatePlaythrough.isPending}
        onSave={onSaveNotes}
        onCancel={() => notesSheetRef.current?.dismiss()}
      />

      <AddTimeBottomSheet
        sheetRef={addTimeSheetRef}
        isSaving={createSession.isPending}
        onSubmit={onSubmitSession}
        onCancel={() => addTimeSheetRef.current?.dismiss()}
      />
    </>
  );
};

export default PlaythroughCard;
