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
  ChevronDownIcon,
  ClockIcon,
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

const CARD_HEIGHT = 96;
const IMAGE_WIDTH = 72;
const ROW_HEIGHT = 40;
const ROW_GAP = 4;
const VISIBLE_SESSIONS = 5;
const SESSIONS_MAX_HEIGHT =
  VISIBLE_SESSIONS * ROW_HEIGHT + (VISIBLE_SESSIONS - 1) * ROW_GAP;

const STATUS_DOT: Record<string, string> = {
  Active: "bg-emerald-500",
  "On Hold": "bg-amber-500",
  Archived: "bg-rose-500",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const PlaythroughCard2 = ({ play }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(play.notes ?? "");

  const imageUri = play.customImage ?? play.image;
  const isArchived = play.status === "Archived";
  const isOnHold = play.status === "On Hold";
  const mutedColor = THEME[theme].mutedForeground;
  const fgColor = THEME[theme].foreground;

  const sessions = useMemo(
    () =>
      [...play.sessions].sort(
        (a, b) =>
          new Date(b.playDate).getTime() - new Date(a.playDate).getTime(),
      ),
    [play.sessions],
  );

  const onError = (err: Error) =>
    Toast.show({ type: "error", text1: err.message });

  // ---- Placeholder mutations: replace each mutationFn with your real API call ----

  const deletePlay = useMutation({
    mutationFn: async (_vars: { playthroughId: string }) => {
      // TODO: call delete playthrough endpoint
    },
    onSuccess: () =>
      Toast.show({ type: "success", text1: "Playthrough Deleted" }),
    onError,
  });

  const deleteSession = useMutation({
    mutationFn: async (_vars: {
      playthroughId: string;
      playthroughSessionId: string;
    }) => {
      // TODO: call delete session endpoint
    },
    onSuccess: () => Toast.show({ type: "success", text1: "Session Deleted" }),
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
    onSuccess: () => {
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
      className="overflow-hidden rounded-2xl border border-border bg-card"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      }}
    >
      {/* Compact row */}
      <Pressable
        className="flex-row active:opacity-90"
        style={{ height: CARD_HEIGHT }}
        onPress={() => setExpanded((v) => !v)}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: IMAGE_WIDTH, height: CARD_HEIGHT }}
            contentFit="cover"
            transition={250}
          />
        ) : (
          <View
            className="items-center justify-center bg-muted"
            style={{ width: IMAGE_WIDTH, height: CARD_HEIGHT }}
          >
            <ImageIcon
              color={mutedColor}
              size={26}
            />
          </View>
        )}

        <View className="flex-1 justify-center gap-1.5 px-3">
          <Text
            className="text-base font-bold"
            numberOfLines={1}
          >
            {play.name}
          </Text>

          <View className="flex-row items-center gap-1.5">
            <View
              className={cn(
                "size-2 rounded-full",
                STATUS_DOT[play.status] ?? "bg-muted",
              )}
            />
            <Text className="text-xs text-muted-foreground">
              {play.status} · {play.platform === "PS" ? "PlayStation" : "PC"}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <ClockIcon
                color={mutedColor}
                size={12}
              />
              <Text className="text-xs font-medium text-muted-foreground">
                {play.totalSeconds > 0
                  ? betterTimeText(play.totalSeconds)
                  : "0h 0m"}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <ListIcon
                color={mutedColor}
                size={12}
              />
              <Text className="text-xs font-medium text-muted-foreground">
                {play.sessions.length}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-center justify-center gap-1 pr-2">
          {!isArchived && (
            <Pressable
              hitSlop={6}
              className="size-10 items-center justify-center rounded-full bg-primary active:opacity-80"
              onPress={addSession}
            >
              <PlusIcon
                color={THEME[theme].primaryForeground}
                size={20}
              />
            </Pressable>
          )}
          <View
            style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
          >
            <ChevronDownIcon
              color={mutedColor}
              size={16}
            />
          </View>
        </View>
      </Pressable>

      {/* Expanded */}
      {expanded && (
        <View className="gap-3 border-t border-border p-3">
          {sessions.length === 0 ? (
            <Text className="py-2 text-center text-sm text-muted-foreground">
              No time recorded yet!
            </Text>
          ) : (
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={sessions.length > VISIBLE_SESSIONS}
              style={{ maxHeight: SESSIONS_MAX_HEIGHT }}
              contentContainerStyle={{ gap: ROW_GAP }}
            >
              {sessions.map((s) => (
                <Pressable
                  key={s.id}
                  disabled={isArchived}
                  onPress={() => openSessionMenu(s)}
                  className="flex-row items-center justify-between rounded-lg bg-muted px-3 active:opacity-70"
                  style={{ height: ROW_HEIGHT }}
                >
                  <Text className="text-sm">{formatDate(s.playDate)}</Text>
                  <Text className="text-sm font-semibold">
                    {secondsToHMS(s.duration)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {editingNotes && (
            <View className="gap-2">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                autoFocus
                placeholder="Write your thoughts..."
                placeholderTextColor={mutedColor}
                textAlignVertical="top"
                className="min-h-24 rounded-xl bg-muted p-3 text-sm text-foreground"
              />
              <View className="flex-row gap-2">
                <Pressable
                  className="h-10 flex-1 items-center justify-center rounded-xl bg-muted active:opacity-70"
                  onPress={cancelNotes}
                >
                  <Text className="text-sm font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  className="h-10 flex-1 items-center justify-center rounded-xl bg-primary active:opacity-80"
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
            </View>
          )}

          {/* Icon-only action row */}
          <View className="flex-row items-center justify-between border-t border-border pt-2">
            <View className="flex-row">
              {!isArchived && (
                <IconAction
                  icon={isOnHold ? PlayIcon : PauseIcon}
                  color={fgColor}
                  onPress={() => changeStatus(isOnHold ? "Active" : "On Hold")}
                />
              )}
              {!isArchived && (
                <IconAction
                  icon={StickyNoteIcon}
                  color={fgColor}
                  onPress={() => setEditingNotes((v) => !v)}
                />
              )}
              <IconAction
                icon={isArchived ? ArchiveRestoreIcon : ArchiveIcon}
                color={fgColor}
                onPress={() => changeStatus(isArchived ? "Active" : "Archived")}
              />
              <IconAction
                icon={TrashIcon}
                color="#f87171"
                onPress={confirmDeletePlaythrough}
              />
            </View>

            {!isArchived && (
              <Pressable
                className="h-10 flex-row items-center gap-1.5 rounded-full bg-secondary px-4 active:opacity-80"
                onPress={finish}
              >
                <FlagIcon
                  color={fgColor}
                  size={14}
                />
                <Text className="text-xs font-semibold">Finish</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

function IconAction({
  icon: Icon,
  color,
  onPress,
}: {
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="size-11 items-center justify-center active:opacity-50"
    >
      <Icon
        color={color}
        size={20}
      />
    </Pressable>
  );
}

export default PlaythroughCard2;
