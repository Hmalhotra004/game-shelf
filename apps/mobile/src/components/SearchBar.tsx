import { Input } from "@/components/ui/input";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { SearchIcon, XIcon } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "./ui/button";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
}: Props) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <View className="relative">
      <View className="absolute left-3 top-0 bottom-0 items-center justify-center z-10">
        <SearchIcon
          size={16}
          color={THEME[theme].foreground}
        />
      </View>
      <Input
        className="pl-9"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />

      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onPress={() => onChangeText("")}
          className="absolute right-0 top-0 bottom-0 items-center justify-center z-10"
        >
          <XIcon
            size={16}
            color={THEME[theme].foreground}
          />
        </Button>
      )}
    </View>
  );
};

export default SearchBar;
