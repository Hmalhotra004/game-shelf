import { Text } from "@/components/ui/text";
import { useScreenMeta } from "@/hooks/useScreenMeta";
import { ClassValue } from "clsx";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  className?: ClassValue;
  paddingTop?: number;
}

const Header = ({ className, paddingTop }: Props) => {
  const insets = useSafeAreaInsets();

  const { title, showHeader, showAvatar } = useScreenMeta();

  if (!showHeader) return null;

  return (
    <View
      className="flex-row items-center justify-between py-3 px-4 bg-background border-b border-border"
      style={{ paddingTop: paddingTop !== undefined ? paddingTop : insets.top }}
    >
      <Text className="text-xl font-bold">{title}</Text>

      {showAvatar ? <Text>ProfileAvatar</Text> : null}
    </View>
  );
};

export default Header;
