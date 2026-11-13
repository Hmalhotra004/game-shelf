import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

interface HomeGameRowProps {
  image: string | null;
  title: string;
  subtitle: string;
  isDlc?: boolean;
  onPress?: () => void;
  right?: ReactNode;
}

const THUMB_SIZE = 48;

export const HomeGameRow = ({
  image,
  title,
  subtitle,
  isDlc,
  onPress,
  right,
}: HomeGameRowProps) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Pressable
      className="flex-row items-center gap-3 active:opacity-70"
      onPress={onPress}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 10 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          className="items-center justify-center rounded-[10px] bg-muted"
          style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
        >
          <ImageIcon
            color={THEME[theme].mutedForeground}
            size={20}
          />
        </View>
      )}

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="shrink text-sm font-semibold"
            numberOfLines={1}
          >
            {title}
          </Text>
          {isDlc && (
            <View className="rounded bg-muted px-1.5 py-0.5">
              <Text className="text-2xs font-semibold text-muted-foreground">
                DLC
              </Text>
            </View>
          )}
        </View>
        <Text
          className="text-xs text-muted-foreground"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {right}
    </Pressable>
  );
};

interface HomeSectionProps {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}

export const HomeSection = ({ title, right, children }: HomeSectionProps) => {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold">{title}</Text>
        {right}
      </View>

      {children}
    </View>
  );
};

export const HomeSectionLoading = ({ rows = 3 }: { rows?: number }) => (
  <View className="gap-2">
    {Array.from({ length: rows }).map((_, idx) => (
      <Skeleton
        key={idx}
        className="h-14 rounded-xl"
      />
    ))}
  </View>
);

export const HomeSectionError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <View className="items-center gap-2 py-4">
    <Text className="text-sm text-muted-foreground">{message}</Text>
    <Button
      variant="outline"
      size="sm"
      onPress={onRetry}
    >
      <Text className="font-semibold">Try again</Text>
    </Button>
  </View>
);

export const HomeSectionEmpty = ({ message }: { message: string }) => (
  <Text className="py-4 text-center text-sm text-muted-foreground">
    {message}
  </Text>
);
