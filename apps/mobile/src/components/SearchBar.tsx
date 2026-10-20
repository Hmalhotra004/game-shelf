import { Input } from "@/components/ui/input";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { SearchIcon, XIcon } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "./ui/button";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  focus?: boolean;
  inSheet?: boolean;
};

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
  focus = false,
  inSheet = false,
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

      {inSheet ? (
        <BottomSheetTextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          autoFocus={focus}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          keyboardType="visible-password"
          className={cn(
            "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
            "pl-9",
          )}
        />
      ) : (
        <Input
          className="pl-9"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          autoFocus={focus}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          keyboardType="visible-password"
        />
      )}

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
