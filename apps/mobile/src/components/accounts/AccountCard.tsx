import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useConfirmSheet } from "@/hooks/useConfirmSheet";
import { api } from "@/lib/api";
import { refreshSession } from "@/lib/refreshSession";
import { THEME } from "@/lib/theme";
import { ACCOUNT_PLATFORM_IMAGE, cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { PlatformAccountType } from "@repo/schemas/types/index";
import type { AccountProfileType } from "@repo/schemas/types/user";
import { ACCENT, TYPE_MAP } from "@repo/utils/lib/account";
import { unlinkAccountMutationOptions } from "@repo/utils/mutations/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRightIcon, Link2Icon } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface Props {
  title: string;
  platform: PlatformAccountType;
  isConnected: boolean;
  isLoading: boolean;
  data: AccountProfileType | null;
  comingSoon?: boolean;
}

const AccountCard = ({
  title,
  platform,
  isConnected,
  isLoading,
  data,
  comingSoon = false,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);

  const [UnLinkSheet, confirmUnlink] = useConfirmSheet(
    "Unlink",
    "Syncing for this platform will stop. You can link it again anytime.",
    "Unlink",
    "destructive",
  );

  const { mutateAsync: unlink, isPending } = useMutation(
    unlinkAccountMutationOptions(
      api,
      queryClient,
      async () => await refreshSession(),
    ),
  );

  const accent = ACCENT[platform];
  const linked = isConnected && !!data;

  const onUnlink = async () => {
    const ok = await confirmUnlink({
      title: `Unlink ${title}?`,
      message:
        "Syncing for this platform will stop. You can link it again anytime.",
    });
    if (!ok) return;

    await unlink({ type: TYPE_MAP[platform] });
  };

  const platformImage = ACCOUNT_PLATFORM_IMAGE[platform];

  return (
    <>
      <View
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card",
          comingSoon ? "opacity-60" : "",
        )}
      >
        {/* accent strip */}
        <View style={{ height: 3, backgroundColor: accent }} />

        <View className="gap-4 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View
                className="size-9 items-center justify-center rounded-lg"
                // style={{ backgroundColor: `${accent}22` }}
              >
                {platformImage ? (
                  <Image
                    source={ACCOUNT_PLATFORM_IMAGE[platform]}
                    style={{ width: 32, height: 32 }}
                    contentFit="cover"
                  />
                ) : (
                  <Link2Icon
                    size={18}
                    color={accent}
                  />
                )}
              </View>
              <Text className="text-lg font-semibold">{title}</Text>
            </View>

            {comingSoon ? (
              <Badge variant="secondary">
                <Text className="text-xs font-medium text-muted-foreground">
                  Coming soon
                </Text>
              </Badge>
            ) : linked ? (
              <Badge>
                <Text className="text-xs font-medium">Connected</Text>
              </Badge>
            ) : null}
          </View>

          {/* body */}
          {isLoading ? (
            <View className="h-16 items-center justify-center">
              <Loader />
            </View>
          ) : linked ? (
            <>
              <View className="flex-row items-center gap-3">
                {data.avatar ? (
                  <Image
                    source={{ uri: data.avatar }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="size-14 rounded-full bg-muted" />
                )}
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    numberOfLines={1}
                  >
                    {data.username}
                  </Text>
                  {data.realName ? (
                    <Text
                      className="text-sm text-muted-foreground"
                      numberOfLines={1}
                    >
                      {data.realName}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Button
                variant="outline"
                disabled={isPending}
                onPress={onUnlink}
              >
                {isPending ? <Loader /> : <Text>Unlink account</Text>}
              </Button>
            </>
          ) : comingSoon ? (
            <Text className="text-sm text-muted-foreground">
              Linking for {title} will be available soon.
            </Text>
          ) : (
            <Pressable
              onPress={() => router.push(`/(profile)/accounts/${platform}`)}
              className="flex-row items-center justify-between rounded-xl"
            >
              <View className="flex-1 pr-3">
                <Text className="font-medium">Link your {title} account</Text>
                <Text className="text-xs text-muted-foreground">
                  Sync your library and progress automatically
                </Text>
              </View>

              <ChevronRightIcon
                size={18}
                color={THEME[theme].mutedForeground}
              />
            </Pressable>
          )}
        </View>
      </View>

      <UnLinkSheet />
    </>
  );
};

export default AccountCard;
