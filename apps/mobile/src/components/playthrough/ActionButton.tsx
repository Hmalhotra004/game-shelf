import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { LucideIcon } from "lucide-react-native";

interface Props {
  icon: LucideIcon;
  label: string;
  color: string;
  onPress: () => void;
}

const ActionButton = ({ color, icon: Icon, label, onPress }: Props) => {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="flex-col"
      onPress={onPress}
    >
      <Icon
        color={color}
        size={20}
      />
      <Text
        className="text-2xs font-medium"
        style={{ color }}
      >
        {label}
      </Text>
    </Button>
  );
};

export default ActionButton;
