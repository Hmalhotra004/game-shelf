import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { GetGamesType } from "@repo/schemas/types/user";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type GameItem = GetGamesType["games"][number];
type DlcItem = GetGamesType["dlcs"][number];

interface Props {
  item: GameItem | DlcItem;
  selected: boolean;
  onPress: (id: string) => void;
}

const IMAGE_WIDTH = 64;
const CARD_HEIGHT = 80;

const isGame = (item: GameItem | DlcItem): item is GameItem =>
  "platform" in item;

const StartPlaythroughCard = ({ item, selected, onPress }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const game = isGame(item) ? item : null;

  const imageUri = game ? (game.customImage ?? game.image) : item.image;

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className={cn(
        "mb-2 h-24 flex-row items-center gap-3 rounded-xl border p-2",
        selected ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <View style={{ width: IMAGE_WIDTH, height: CARD_HEIGHT }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            transition={250}
            style={{
              width: IMAGE_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 8,
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-muted rounded-md">
            <ImageIcon
              color={THEME[theme].mutedForeground}
              size={32}
            />
          </View>
        )}
      </View>

      <View className="flex-1 gap-1">
        <Text
          numberOfLines={2}
          className="font-semibold text-foreground"
        >
          {item.name}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {game ? String(game.platform) : "DLC"}
        </Text>
      </View>

      {/* Selection indicator */}
      <View
        className={cn(
          "size-5 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary" : "border-muted-foreground",
        )}
      >
        {selected && (
          <View className="size-2 rounded-full bg-primary-foreground" />
        )}
      </View>
    </Pressable>
  );
};

export default memo(StartPlaythroughCard);
