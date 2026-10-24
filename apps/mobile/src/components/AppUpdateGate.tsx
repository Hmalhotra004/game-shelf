import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { downloadAndInstall } from "@/lib/updater";
import { useQuery } from "@tanstack/react-query";
import { compareVersions, validate } from "compare-versions";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { DownloadIcon, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getLatestReleaseQueryOptions,
  getMobileVersionQueryOptions,
} from "@repo/utils/queries/app";

import { useThemeStore } from "@/store/useThemeStore";
import {
  AppState,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const getCurrentAppVersion = () =>
  Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? null;

const isNewerVersion = (target?: string, current?: string | null) => {
  if (!target || !current) return false;
  if (!validate(target) || !validate(current)) return false;
  return compareVersions(target, current) > 0;
};

export default function AppUpdateGate() {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);

  const { data, refetch: refetchMin } = useQuery(
    getMobileVersionQueryOptions(api),
  );

  const { data: release, refetch: refetchRelease } = useQuery(
    getLatestReleaseQueryOptions(Platform.OS === "android"),
  );

  const currentVersion = useMemo(() => getCurrentAppVersion(), []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        refetchMin();
        refetchRelease();
      }
    });
    return () => sub.remove();
  }, [refetchMin, refetchRelease]);

  // In-app install is Android only
  if (Platform.OS !== "android") return null;

  const forceUpdate = isNewerVersion(data?.MIN_VERSION, currentVersion);
  const hasOptionalUpdate =
    !forceUpdate && isNewerVersion(release?.version, currentVersion);
  const showOptional = hasOptionalUpdate && release?.version !== dismissed;

  if (!forceUpdate && !showOptional) return null;

  const targetVersion = release?.version ?? data?.MIN_VERSION;

  const install = async () => {
    setError(null);
    if (!release) return; // button is disabled in this case
    try {
      setProgress(0);
      await downloadAndInstall(release, setProgress);
    } catch {
      setError("Download failed. Check your connection and try again.");
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;

  const notes = release?.notes ? (
    <ScrollView className="max-h-64">
      {/* pass a `style` prop here to match your theme colors */}
      <Markdown>{release.notes}</Markdown>
    </ScrollView>
  ) : null;

  const actions = (
    <View className="gap-2">
      {error && <Text className="text-destructive">{error}</Text>}
      <Button
        size="lg"
        onPress={install}
        disabled={!release || busy}
      >
        <Icon
          as={DownloadIcon}
          size={18}
        />
        <Text>
          {busy
            ? `Downloading ${Math.round((progress ?? 0) * 100)}%`
            : "Update now"}
        </Text>
      </Button>
      {/* If GitHub is unreachable during a forced update, still give a way out */}
      {!release && release !== undefined ? null : null}
      {!release && (
        <Button
          variant="outline"
          onPress={() =>
            Linking.openURL(
              `https://github.com/Hmalhotra004/game-shelf/releases`,
            )
          }
        >
          <Text>Open releases page</Text>
        </Button>
      )}
    </View>
  );

  if (forceUpdate) {
    return (
      <View
        className="absolute inset-0 z-50 bg-background px-6"
        style={{
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-1 justify-center gap-6">
          <View className="gap-3">
            <Text className="text-left text-3xl">Update required</Text>
            <Text className="text-muted-foreground text-base leading-6">
              This version is no longer supported. Please update to continue.
            </Text>
          </View>

          <View className="rounded-lg border border-border bg-card p-4">
            <Text variant="muted">Current version</Text>
            <Text className="mt-1 text-lg font-inter-semiBold">
              {currentVersion ?? "Unknown"}
            </Text>
            <Text
              variant="muted"
              className="mt-4"
            >
              Latest version
            </Text>
            <Text className="mt-1 text-lg font-inter-semiBold">
              {targetVersion ?? "Unknown"}
            </Text>
          </View>

          {notes}
        </View>
        {actions}
      </View>
    );
  }

  return (
    <View
      className="absolute inset-0 z-50 justify-end bg-black/50"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="gap-4 rounded-t-2xl bg-card p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-inter-semiBold">
            Update {release?.version} available
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss update prompt"
            disabled={busy}
            className="size-9 items-center justify-center rounded-md active:bg-accent"
            onPress={() => setDismissed(release?.version ?? null)}
          >
            <Icon
              as={X}
              size={18}
              className="text-muted-foreground"
            />
          </Pressable>
        </View>
        {notes}
        {actions}
      </View>
    </View>
  );
}
