import { Text } from "@/components/ui/text";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const StatTile = ({ color, icon: Icon, label, value }: Props) => {
  return (
    <View className="flex-1 gap-1 rounded-2xl bg-muted px-3 py-2.5">
      <View className="flex-row items-center gap-1">
        <Icon
          color={color}
          size={12}
        />
        <Text className="text-2xs font-medium text-muted-foreground">
          {label}
        </Text>
      </View>
      <Text
        className="text-sm font-bold"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

export default StatTile;
