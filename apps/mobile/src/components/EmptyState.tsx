import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon: Icon, title, description }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const colors = THEME[theme];

  return (
    <View className="w-full items-center gap-3 rounded-lg border border-dashed border-border p-6">
      <View className="size-10 items-center justify-center rounded-full bg-muted">
        <Icon
          size={20}
          color={colors.mutedForeground}
        />
      </View>

      <View className="items-center gap-1">
        <Text className="text-sm font-medium text-foreground">{title}</Text>
        {description ? (
          <Text className="text-center text-sm text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
