import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { getCurrentAppVersion, isNewerVersion } from "@/lib/updater";
import { useUpdateStore } from "@/store/useUpdateStore";
import { RELEASES_URL } from "@repo/utils/constants";
import { useQuery } from "@tanstack/react-query";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Linking, Platform, View } from "react-native";
import Toast from "react-native-toast-message";

import {
  getLatestReleaseQueryOptions,
  getMobileVersionQueryOptions,
} from "@repo/utils/queries/app";

import {
  // GithubIcon,
  GlobeIcon,
  LibraryIcon,
  MailIcon,
  MessageCircleIcon,
} from "lucide-react-native";

type RowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
};

const Row = ({ title, subtitle, onPress, disabled }: RowProps) => (
  <Button
    variant="ghost"
    onPress={onPress}
    disabled={disabled}
    className="h-auto items-start justify-start flex-col"
  >
    <Text className="text-lg">{title}</Text>
    {subtitle ? (
      <Text
        variant="muted"
        className="mt-0.5"
      >
        {subtitle}
      </Text>
    ) : null}
  </Button>
);

// placeholders for now
const SOCIALS = [GlobeIcon, MessageCircleIcon, MailIcon];

const AboutScreen = () => {
  const [checking, setChecking] = useState(false);
  const setDismissed = useUpdateStore((s) => s.setDismissed);

  const { refetch: refetchMin } = useQuery(getMobileVersionQueryOptions(api));
  const { refetch: refetchRelease } = useQuery(
    getLatestReleaseQueryOptions(Platform.OS === "android"),
  );

  const version = getCurrentAppVersion() ?? "Unknown";
  const build = Application.nativeBuildVersion;
  const versionLabel = build ? `${version} (${build})` : version;

  const copyVersion = async () => {
    await Clipboard.setStringAsync(versionLabel);
    Toast.show({ type: "success", text1: "Version copied" });
  };

  const checkForUpdates = async () => {
    if (Platform.OS !== "android") {
      Toast.show({ type: "info", text1: "In-app updates are Android only" });
      return;
    }

    setChecking(true);
    try {
      const [min, release] = await Promise.all([
        refetchMin(),
        refetchRelease(),
      ]);

      if (min.isError && release.isError) {
        Toast.show({ type: "error", text1: "Couldn't check for updates" });
        return;
      }

      const current = getCurrentAppVersion();
      const hasUpdate =
        isNewerVersion(min.data?.MIN_VERSION, current) ||
        isNewerVersion(release.data?.version, current);

      if (hasUpdate) {
        // clear any earlier "dismiss" so the gate shows again
        setDismissed(null);
      } else {
        Toast.show({ type: "success", text1: "You're on the latest version" });
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper
        paddingHorizontal={0}
        paddingTop={0}
      >
        <View className="flex-1">
          <View className="items-center py-10">
            <View className="size-24 items-center justify-center rounded-3xl bg-primary/15">
              <Icon
                as={LibraryIcon}
                size={48}
                className="text-primary"
              />
            </View>
          </View>

          <Separator />

          <View className="px-0 gap-4">
            <Row
              title="Version"
              subtitle={versionLabel}
              onPress={copyVersion}
            />
            <Row
              title={checking ? "Checking…" : "Check for updates"}
              onPress={checkForUpdates}
              disabled={checking}
            />
            <Row
              title="What's new"
              onPress={() => Linking.openURL(RELEASES_URL).catch(() => {})}
            />
            <Row
              title="Open source licenses"
              onPress={() => {}}
            />
            <Row
              title="Privacy policy"
              onPress={() => {}}
            />
          </View>

          <View className="flex-row items-center justify-center gap-4 py-6">
            {SOCIALS.map((SocialIcon, i) => (
              <Button
                key={i}
                size="icon"
                variant="ghost"
                className="size-12 rounded-full"
                onPress={() => {}}
              >
                <Icon
                  as={SocialIcon}
                  size={26}
                  className="text-primary"
                />
              </Button>
            ))}
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default AboutScreen;
