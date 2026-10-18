import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { FormInput } from "@/components/form/form";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { authClient } from "@/lib/authClient";
import { refreshSession } from "@/lib/refreshSession";
import { THEME } from "@/lib/theme";
import { ACCOUNT_PLATFORM_IMAGE } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ACCENT } from "@repo/utils/lib/account";
import { linkSteamAccountMutationOptions } from "@repo/utils/mutations/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  ChevronDownIcon,
  ExternalLinkIcon,
  InfoIcon,
} from "lucide-react-native";

import {
  linkSteamAccountSchema,
  LinkSteamAccountSchemaType,
} from "@repo/schemas/schemas/user";

import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const SteamAccount = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);

  const { data: session } = authClient.useSession();
  const [helpOpen, setHelpOpen] = useState(false);

  const link = useMutation(linkSteamAccountMutationOptions(api, queryClient));

  const form = useForm<LinkSteamAccountSchemaType>({
    resolver: zodResolver(linkSteamAccountSchema),
    defaultValues: { steamId: "" },
  });

  const linkedSteamId = (
    session?.user as { steamId?: string | null } | undefined
  )?.steamId;
  if (linkedSteamId) return <Redirect href="/profile/accounts" />;

  const isPending = link.isPending;

  const onSubmit = async (values: LinkSteamAccountSchemaType) => {
    await link.mutateAsync(values);
    await refreshSession();
    router.back();
  };

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={16}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View className="items-center gap-2">
              <Image
                source={ACCOUNT_PLATFORM_IMAGE["steam"]}
                style={{ width: 48, height: 48 }}
                contentFit="cover"
              />
              <Text className="text-2xl font-bold">
                Link your Steam account
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                Connect your Steam account to sync your profile and games
              </Text>
            </View>

            {/* Sign in with Steam (not wired yet, same as web TODO) */}
            <View className="gap-2">
              <Button
                disabled
                style={{ backgroundColor: `${ACCENT["steam"]}22` }}
              >
                <Text className="text-foreground">Sign in with</Text>
                <Image
                  source={ACCOUNT_PLATFORM_IMAGE["steam"]}
                  style={{ width: 24, height: 24 }}
                  contentFit="cover"
                />
              </Button>
              <Text className="text-center text-xs text-muted-foreground">
                Coming soon
              </Text>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <Text className="text-sm text-muted-foreground">OR</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            {/* Manual form */}
            <View className="gap-3 rounded-2xl border border-border bg-card p-4">
              <Text className="text-sm text-muted-foreground">
                Enter your SteamID manually
              </Text>

              <FormInput
                name="steamId"
                control={form.control}
                placeholder="76561199092075371"
                keyboardType="number-pad"
                disabled={isPending}
              />

              <Button
                disabled={isPending}
                onPress={form.handleSubmit(onSubmit)}
              >
                {isPending ? <Loader /> : <Text>Link account</Text>}
              </Button>
            </View>

            {/* How to find SteamID (collapsible) */}
            <View className="overflow-hidden rounded-2xl border border-border bg-card">
              <Pressable
                onPress={() => setHelpOpen((v) => !v)}
                className="flex-row items-center justify-between px-4 py-4 active:bg-muted"
              >
                <Text className="font-semibold">How to find your SteamID</Text>
                <View
                  style={{
                    transform: [{ rotate: helpOpen ? "180deg" : "0deg" }],
                  }}
                >
                  <ChevronDownIcon
                    size={18}
                    color={THEME[theme].mutedForeground}
                  />
                </View>
              </Pressable>

              {helpOpen && (
                <View className="gap-3 border-t border-border px-4 py-4">
                  {[
                    "Open your Steam profile",
                    "Click on your username",
                    "Copy the number from the profile URL",
                  ].map((step, i) => (
                    <View
                      key={step}
                      className="flex-row items-start gap-3"
                    >
                      <View className="size-6 items-center justify-center rounded-full bg-primary/10">
                        <Text className="text-xs font-semibold text-primary">
                          {i + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-sm text-muted-foreground">
                        {step}
                      </Text>
                    </View>
                  ))}

                  <Text className="text-xs text-muted-foreground">
                    Example: steamcommunity.com/profiles/
                    <Text className="text-xs font-medium text-foreground">
                      76561199092075371
                    </Text>
                  </Text>

                  <Button
                    variant="outline"
                    onPress={() =>
                      Linking.openURL("https://steamcommunity.com/my")
                    }
                  >
                    <ExternalLinkIcon
                      size={16}
                      color={THEME[theme].foreground}
                    />
                    <Text>Open Steam profile</Text>
                  </Button>
                </View>
              )}
            </View>

            {/* Things to know */}
            <View className="gap-2 rounded-2xl bg-muted/50 p-4">
              <View className="flex-row items-center gap-2">
                <InfoIcon
                  size={16}
                  color={THEME[theme].mutedForeground}
                />
                <Text className="font-semibold">Things to know</Text>
              </View>

              <Text className="text-sm text-muted-foreground">
                {"\u2022"} Set your Steam profile privacy to{" "}
                <Text className="text-sm font-medium text-foreground">
                  Public
                </Text>
                .
              </Text>

              <Text className="text-sm text-muted-foreground">
                {"\u2022"} Your{" "}
                <Text className="text-sm font-medium text-foreground">
                  17-digit SteamID
                </Text>{" "}
                is not your username.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </View>
  );
};

export default SteamAccount;
