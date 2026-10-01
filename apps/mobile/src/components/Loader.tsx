import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { ActivityIndicator } from "react-native";

interface Props {
  size?: number;
  color?: string;
}

const Loader = ({ color, size }: Props) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <ActivityIndicator
      color={color ? color : THEME[theme].primary}
      size={size ? size : 20}
    />
  );
};

export default Loader;
