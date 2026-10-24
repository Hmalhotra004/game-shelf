import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { downloadAndInstall } from "@/lib/updater";
import { useThemeStore } from "@/store/useThemeStore";
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

const withMentions = (md: string) =>
  md.replace(
    /(^|[^\w`\[/])@([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\b/g,
    "$1[@$2](https://github.com/$2)",
  );

const linkifyUrls = (md: string) =>
  md.replace(/(^|\s)(https?:\/\/[^\s)<]+)/g, (_, pre: string, url: string) => {
    const compare = url.match(/\/compare\/(.+)$/);
    if (compare) return `${pre}[\`${compare[1]}\`](${url})`; // 0.1.0...0.1.1

    const pr = url.match(/\/pull\/(\d+)$/);
    if (pr) return `${pre}[#${pr[1]}](${url})`; // #12

    return `${pre}[${url}](${url})`;
  });

const formatNotes = (md: string) => withMentions(linkifyUrls(md));

export default function AppUpdateGate() {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);

  const colors = THEME[theme];

  const markdownStyle = useMemo(
    () => ({
      body: { color: colors.foreground, fontSize: 14, lineHeight: 20 },
      heading1: { color: colors.foreground, fontSize: 20, marginVertical: 6 },
      heading2: { color: colors.foreground, fontSize: 18, marginVertical: 6 },
      heading3: { color: colors.foreground, fontSize: 16, marginVertical: 4 },
      strong: { color: colors.foreground, fontWeight: "700" as const },
      em: { color: colors.foreground },
      bullet_list_icon: { color: colors.foreground },
      ordered_list_icon: { color: colors.foreground },
      code_inline: {
        color: colors.foreground,
        backgroundColor: colors.muted,
        borderRadius: 4,
        paddingHorizontal: 4,
      },
      fence: { color: colors.foreground, backgroundColor: colors.muted },
      code_block: { color: colors.foreground, backgroundColor: colors.muted },
      link: { color: colors.primary, textDecorationLine: "underline" as const },
      hr: { backgroundColor: colors.border },
    }),
    [colors],
  );

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
      <Markdown
        style={markdownStyle}
        onLinkPress={(url) => {
          Linking.openURL(url).catch(() => {});
          return false; // stop the library's default handling
        }}
      >
        {formatNotes(release.notes)}
      </Markdown>
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
