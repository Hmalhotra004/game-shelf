import { Input } from "@/components/ui/input";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { SearchIcon, XIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "./ui/button";

type Props = {
  onDebouncedChange: (text: string) => void;
  defaultValue?: string;
  placeholder?: string;
  focus?: boolean;
  delay?: number;
};

const SearchBar = ({
  onDebouncedChange,
  defaultValue = "",
  placeholder = "Search...",
  focus = false,
  delay = 400,
}: Props) => {
  const [text, setText] = useState(defaultValue);
  const debounced = useDebounce(text.trim(), delay);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    onDebouncedChange(debounced);
  }, [debounced, onDebouncedChange]);

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
        value={text}
        onChangeText={setText}
        autoFocus={focus}
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="visible-password"
      />

      {text.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onPress={() => setText("")}
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
