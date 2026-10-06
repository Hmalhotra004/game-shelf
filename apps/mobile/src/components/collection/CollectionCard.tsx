import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { betterTimeText } from "@repo/utils/lib/utils";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import { View } from "react-native";
import CollectionCardContextMenu from "./CollectionCardContextMenu";

interface Props {
  game: CollectionGetMany;
}

const CollectionCard = ({ game }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const imageUri = game.customImage ?? game.image;

  const getPlayTime = () => {
    if (game.status === "Online") return betterTimeText(game.onlinePlaySecs);

    if (game.totalPlaytime > 0) return betterTimeText(game.totalPlaytime);

    return "0h 0m";
  };

  const playSecs = getPlayTime();

  return (
    <CollectionCardContextMenu game={game}>
      <View className="flex-row overflow-hidden rounded-xl bg-card">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 80, height: 96 }}
            contentFit="cover"
          />
        ) : (
          <ImageIcon
            color={THEME[theme].foreground}
            width={80}
            height={96}
          />
        )}

        <View className="flex-1 justify-between py-1.5 px-2.5">
          <View>
            <Text
              className="font-semibold"
              numberOfLines={1}
            >
              {game.name}
            </Text>

            <Text className="mt-0.5 text-xs text-muted-foreground">
              {game.platform} · {game.status}
              {game.dlcCount > 0 ? ` · ${game.dlcCount} DLC` : ""}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-xs text-muted-foreground">{playSecs}</Text>
            <Text className="text-xs text-muted-foreground">
              {game.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </CollectionCardContextMenu>
  );
};

export default CollectionCard;
