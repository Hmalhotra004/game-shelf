import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn, handleError } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { PlaythroughStatusType as Status } from "@repo/schemas/types/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import ActionButton from "./ActionButton";
import StatTile from "./StatTile";

import {
  betterTimeText,
  PLAYTHROUGH_STATUS_STYLE,
  secondsToHMS,
} from "@repo/utils/lib/utils";

import {
  deletePlaythroughMutationOptions,
  updatePlaythroughMutationOptions,
} from "@repo/utils/mutations/playthrough";

import {
  PlaythroughGetManyType,
  Session as SessionType,
} from "@repo/schemas/types/playthrough";

import { useConfirmSheet } from "@/hooks/useConfirmSheet";
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

  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(play.notes ?? "");

  const imageUri = play.customCoverImage ?? play.coverImage;
  const isArchived = play.status === "Archived";
  const isOnHold = play.status === "On Hold";
  const statusStyle =
    PLAYTHROUGH_STATUS_STYLE[play.status] ?? PLAYTHROUGH_STATUS_STYLE.Active;
  const mutedColor = THEME[theme].mutedForeground;
  const fgColor = THEME[theme].foreground;

  const queryClient = useQueryClient();

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

  const updatePlaythrough = useMutation(
    updatePlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {},
    ),
  );

  const updateSession = useMutation({});

  const deletePlay = useMutation(
    deletePlaythroughMutationOptions(
      api,
      queryClient,
      (err) => handleError(err),
      () => {},
    ),
  );

  const deleteSession = useMutation({});

  const [DeletePlaySheet, confirmDeletePlay] = useConfirmSheet(
    "Delete Playthrough",
    "",
    "Delete",
    "destructive",
  );

  async function onDeletePlay() {
    const ok = await confirmDeletePlay();
    if (!ok) return;

    deletePlay.mutate(play.id);
  }

  function changeStatus(status: Status) {
    updatePlaythrough.mutate({ id: play.id, status, notes });
  }

  function cancelNotes() {
    setNotes(play.notes ?? "");
    setEditingNotes(false);
  }

  // NOTE: adjust these routes to your mobile screens / bottom sheets.
  function addSession() {}

  function editSession(s: SessionType) {}

  function finish() {
    router.push({
      pathname: "/(playthrough)/finish/[playthroughId]",
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
          {(editingNotes || !!play.notes) && (
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </Text>

              {editingNotes ? (
                <>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    autoFocus
                    placeholder="Write your thoughts..."
                    placeholderTextColor={mutedColor}
                    textAlignVertical="top"
                    className="min-h-28 rounded-2xl bg-muted p-3 text-sm text-foreground"
                  />
                  <View className="flex-row gap-2">
                    <Pressable
                      className="h-11 flex-1 items-center justify-center rounded-xl bg-muted active:opacity-70"
                      onPress={cancelNotes}
                    >
                      <Text className="text-sm font-medium">Cancel</Text>
                    </Pressable>
                    <Pressable
                      className="h-11 flex-1 items-center justify-center rounded-xl bg-primary active:opacity-80"
                      disabled={updatePlaythrough.isPending}
                      onPress={() => {}}
                    >
                      <Text className="text-sm font-semibold text-primary-foreground">
                        Save
                        {/* {updateNotes.isPending ? "Saving..." : "Save"} */}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <Pressable
                  disabled={isArchived}
                  onPress={() => setEditingNotes(true)}
                  className="rounded-2xl bg-muted p-3 active:opacity-70"
                >
                  <Text
                    className="text-sm text-muted-foreground"
                    numberOfLines={3}
                  >
                    {play.notes}dsfdsfdsfdsfds
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Quick actions */}
          <View className="flex-row justify-between border-t border-border pt-3">
            {!isArchived && (
              <ActionButton
                icon={isOnHold ? PlayIcon : PauseIcon}
                label={isOnHold ? "Resume" : "Pause"}
                color={fgColor}
                onPress={() => changeStatus(isOnHold ? "Active" : "On Hold")}
              />
            )}

            {!isArchived && (
              <ActionButton
                icon={StickyNoteIcon}
                label="Notes"
                color={fgColor}
                onPress={() => setEditingNotes(true)}
              />
            )}

            <ActionButton
              icon={isArchived ? ArchiveRestoreIcon : ArchiveIcon}
              label={isArchived ? "Restore" : "Archive"}
              color={fgColor}
              onPress={() => changeStatus(isArchived ? "Active" : "Archived")}
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
              onPress={() => {}}
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

      <DeletePlaySheet />
    </>
  );
};

export default PlaythroughCard;
