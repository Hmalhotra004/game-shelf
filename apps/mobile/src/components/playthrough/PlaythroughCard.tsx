import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { PlaythroughGetManyType } from "@repo/schemas/types/playthrough";
import { betterTimeText, secondsToHMS } from "@repo/utils/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

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
  type LucideIcon,
} from "lucide-react-native";

interface Props {
  play: PlaythroughGetManyType;
}

type Status = PlaythroughGetManyType["status"];
type SessionType = PlaythroughGetManyType["sessions"][number];

const HERO_HEIGHT = 128;
const SESSION_ROW_HEIGHT = 48;
const SESSION_GAP = 6;
const VISIBLE_SESSIONS = 5;
const SESSIONS_MAX_HEIGHT =
  VISIBLE_SESSIONS * SESSION_ROW_HEIGHT + (VISIBLE_SESSIONS - 1) * SESSION_GAP;

const STATUS_STYLE: Record<
  string,
  { bg: string; border: string; bar: string }
> = {
  Active: {
    bg: "bg-emerald-600/20",
    border: "border-emerald-500",
    bar: "bg-emerald-600",
  },
  "On Hold": {
    bg: "bg-amber-500/20",
    border: "border-amber-400",
    bar: "bg-amber-500",
  },
  Archived: {
    bg: "bg-rose-600/20",
    border: "border-rose-500",
    bar: "bg-rose-600",
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const PlaythroughCard = ({ play }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const router = useRouter();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(play.notes ?? "");

  const imageUri = play.customImage ?? play.image;
  const isArchived = play.status === "Archived";
  const isOnHold = play.status === "On Hold";
  const statusStyle = STATUS_STYLE[play.status] ?? STATUS_STYLE.Active;
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
  const lastPlayed = sessions[0] ? formatDate(sessions[0].playDate) : "—";

  const onError = (err: Error) =>
    Toast.show({ type: "error", text1: err.message });

  // ---- Placeholder mutations: replace each mutationFn with your real API call ----

  const deletePlay = useMutation({
    mutationFn: async (_vars: { playthroughId: string }) => {
      // TODO: call delete playthrough endpoint
    },
    onSuccess: async () => {
      Toast.show({ type: "success", text1: "Playthrough Deleted" });
    },
    onError,
  });

  const deleteSession = useMutation({
    mutationFn: async (_vars: {
      playthroughId: string;
      playthroughSessionId: string;
    }) => {
      // TODO: call delete session endpoint
    },
    onSuccess: async () => {
      Toast.show({ type: "success", text1: "Session Deleted" });
    },
    onError,
  });

  const updateStatus = useMutation({
    mutationFn: async (_vars: { playthroughId: string; status: Status }) => {
      // TODO: call update status endpoint
    },
    onError,
  });

  const updateNotes = useMutation({
    mutationFn: async (_vars: { playthroughId: string; notes: string }) => {
      // TODO: call update notes endpoint
    },
    onSuccess: async () => {
      setEditingNotes(false);
      Toast.show({ type: "success", text1: "Notes saved" });
    },
    onError,
  });

  function changeStatus(status: Status) {
    updateStatus.mutate({ playthroughId: play.id, status });
  }

  function confirmDeletePlaythrough() {
    Alert.alert(
      "Delete Playthrough",
      `"${play.name}" and all its sessions will be removed. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePlay.mutate({ playthroughId: play.id }),
        },
      ],
    );
  }

  function confirmDeleteSession(s: SessionType) {
    Alert.alert("Delete Session", "This action cannot be undone", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteSession.mutate({
            playthroughId: play.id,
            playthroughSessionId: s.id,
          }),
      },
    ]);
  }

  // Tapping the "more" button on a session row
  function openSessionMenu(s: SessionType) {
    Alert.alert(
      formatDate(s.playDate),
      secondsToHMS(s.duration),
      [
        { text: "Edit", onPress: () => editSession(s) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteSession(s),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  }

  function cancelNotes() {
    setNotes(play.notes ?? "");
    setEditingNotes(false);
  }

  // NOTE: adjust these routes to your mobile screens / bottom sheets.
  function addSession() {
    router.push({
      pathname: "/(playthrough)/add-session" as never,
      params: { playthroughId: play.id },
    } as never);
  }

  function editSession(s: SessionType) {
    router.push({
      pathname: "/(playthrough)/edit-session" as never,
      params: { playthroughId: play.id, sessionId: s.id },
    } as never);
  }

  function finish() {
    router.push({
      pathname: "/(playthrough)/finish/[playthroughId]" as never,
      params: { playthroughId: play.id },
    } as never);
  }

  return (
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
            className="absolute inset-0 bg-black/45"
          />
        )}

        {/* Status */}
        <View className="absolute left-3 top-3">
          <Badge
            variant="outline"
            className={cn(statusStyle.bg, statusStyle.border)}
          >
            <Text
              className={cn("text-2xs font-semibold", imageUri && "text-white")}
            >
              {play.status}
            </Text>
          </Badge>
        </View>

        {/* Title + meta */}
        <View className="absolute inset-x-3 bottom-3 gap-1">
          <Text
            className={cn(
              "text-xl font-bold leading-tight",
              imageUri && "text-white",
            )}
            numberOfLines={2}
          >
            {play.name}
          </Text>
          <Text
            className={cn(
              "text-xs font-medium",
              imageUri ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {play.platform === "PS" ? "PlayStation" : "PC"} · {play.provider}
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
              <Pressable
                hitSlop={8}
                className="h-9 flex-row items-center gap-1 rounded-full bg-primary px-3.5 active:opacity-80"
                onPress={addSession}
              >
                <PlusIcon
                  color={THEME[theme].primaryForeground}
                  size={14}
                />
                <Text className="text-xs font-semibold text-primary-foreground">
                  Add Entry
                </Text>
              </Pressable>
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
                    onPress={() => openSessionMenu(s)}
                    className="flex-row items-center justify-between rounded-xl bg-muted pl-3.5 pr-1 active:opacity-70"
                    style={{ height: SESSION_ROW_HEIGHT }}
                  >
                    <Text className="text-sm">{formatDate(s.playDate)}</Text>

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
                    disabled={updateNotes.isPending}
                    onPress={() =>
                      updateNotes.mutate({ playthroughId: play.id, notes })
                    }
                  >
                    <Text className="text-sm font-semibold text-primary-foreground">
                      {updateNotes.isPending ? "Saving..." : "Save"}
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
                  {play.notes}
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
            color="#f87171"
            onPress={confirmDeletePlaythrough}
          />
        </View>

        {/* Primary CTA */}
        {!isArchived && (
          <Pressable
            className="h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-secondary active:opacity-80"
            onPress={finish}
          >
            <FlagIcon
              color={fgColor}
              size={16}
            />
            <Text className="text-sm font-semibold">Finish Playthrough</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 gap-1 rounded-2xl bg-muted px-3 py-2.5">
      <View className="flex-row items-center gap-1">
        <Icon
          color={color}
          size={12}
        />
        <Text className="text-2xs font-medium text-muted-foreground">
          {label}
        </Text>
      </View>
      <Text
        className="text-sm font-bold"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  icon: Icon,
  label,
  color,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-w-16 items-center gap-1 py-1 active:opacity-50"
    >
      <Icon
        color={color}
        size={20}
      />
      <Text
        className="text-2xs font-medium"
        style={{ color }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default PlaythroughCard;
