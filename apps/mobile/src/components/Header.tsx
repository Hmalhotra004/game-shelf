import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useScreenMeta } from "@/hooks/useScreenMeta";
import { useSession } from "@/hooks/useSession";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { ClassValue } from "clsx";
import { useRouter } from "expo-router";
import { ChevronLeftIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  className?: ClassValue;
  paddingTop?: number;
  onBack?: () => void;
}

const Header = ({ className, paddingTop, onBack }: Props) => {
  const { session, isPending } = useSession();

  const user = session?.user;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);

  const { title, showHeader, showAvatar, showBack } = useScreenMeta();

  if (!showHeader) return null;

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      className="flex-row items-center justify-between py-3 px-4 bg-background border-b border-border"
      style={{ paddingTop: paddingTop !== undefined ? paddingTop : insets.top }}
    >
      <View className="flex-row items-center gap-2">
        {showBack && (
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onPress={handleBack}
          >
            <ChevronLeftIcon
              color={THEME[theme].foreground}
              size={18}
            />
          </Button>
        )}
        <Text className="text-xl font-bold">{title}</Text>
      </View>

      {showAvatar ? (
        <Pressable onPress={() => router.push({ pathname: "/profile" })}>
          <Avatar alt="user-avatar">
            <AvatarFallback>
              <Text>{user?.name.charAt(0).toUpperCase()}</Text>
            </AvatarFallback>
            {user?.image && <AvatarImage src={user?.image} />}
          </Avatar>
        </Pressable>
      ) : null}
    </View>
  );
};

export default Header;
