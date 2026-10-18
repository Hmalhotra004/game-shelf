import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { useConfirmSheet } from "@/hooks/useConfirmSheet";
import { authClient } from "@/lib/authClient";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { AppRoute } from "@/lib/screens";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import {
  ChevronRightIcon,
  HeartIcon,
  Link2Icon,
  ListIcon,
  LogOutIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react-native";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: AppRoute;
  disabled: boolean;
};

const MENU: MenuItem[] = [
  {
    label: "Manage Lists",
    icon: ListIcon,
    href: "/(profile)/lists",
    disabled: true,
  },
  {
    label: "Manage WishList",
    icon: HeartIcon,
    href: "/(profile)/wishlist",
    disabled: true,
  },
  {
    label: "Manage Accounts",
    icon: Link2Icon,
    href: "/(profile)/accounts",
    disabled: true,
  },
  // {
  //   label: "Stats",
  //   icon: BarChart3Icon,
  //   href: "/(profile)/stats",
  //   disabled: true,
  // },
  {
    label: "Settings",
    icon: SettingsIcon,
    href: "/(profile)/settings",
    disabled: true,
  },
];

const Profile = () => {
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);
  const { data: session } = authClient.useSession();

  const [LogoutSheet, confirmLogout] = useConfirmSheet(
    "Log out?",
    "You'll need to sign in again to access your shelf.",
    "Logout",
    "destructive",
  );

  const user = session?.user;
  const initials = (user?.name ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  const logout = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/(auth)") },
    });
  };

  const onLogoutPress = async () => {
    const ok = await confirmLogout();
    if (!ok) return;

    logout();
  };

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper>
        <View className="flex-1 gap-6">
          <View className="items-center gap-3">
            <Avatar
              alt={user?.name ?? "Profile"}
              className="size-24"
            >
              {user?.image ? (
                <AvatarImage source={{ uri: user.image }} />
              ) : null}
              <AvatarFallback>
                <Text className="text-2xl font-semibold">{initials}</Text>
              </AvatarFallback>
            </Avatar>

            <View className="items-center">
              {user?.name ? (
                <Text className="text-lg font-semibold">{user.name}</Text>
              ) : null}
              <Text className="text-sm text-muted-foreground">
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Menu */}
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            {MENU.map(({ label, icon: Icon, href }, i) => (
              <Pressable
                key={label}
                onPress={() => router.push(href)}
                className={`flex-row items-center gap-3 px-4 py-4 active:bg-muted ${
                  i !== MENU.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View className="size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon
                    size={18}
                    color={THEME[theme].primary}
                  />
                </View>
                <Text className="flex-1 text-base">{label}</Text>
                <ChevronRightIcon
                  size={18}
                  color={THEME[theme].mutedForeground}
                />
              </Pressable>
            ))}
          </View>

          {/* Logout + version */}
          <View className="mt-auto gap-4 pb-4">
            <Button
              variant="destructive"
              onPress={onLogoutPress}
            >
              <LogOutIcon
                size={16}
                color={THEME[theme].primary}
              />
              <Text>Logout</Text>
            </Button>

            <Text className="text-center text-xs text-muted-foreground">
              Version {Application.nativeApplicationVersion} (
              {Application.nativeBuildVersion})
            </Text>
          </View>
        </View>
      </ScreenWrapper>

      <LogoutSheet />
    </View>
  );
};

export default Profile;
