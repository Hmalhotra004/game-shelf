import { Text } from "@/components/ui/text";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { betterTimeText } from "@repo/utils/lib/utils";
import { Image } from "expo-image";
import { View } from "react-native";

interface Props {
  game: CollectionGetMany;
}

const CollectionCard = ({ game }: Props) => {
  const imageUri = game.customImage ?? game.image;

  const getPlayTime = () => {
    if (game.status === "Online") return betterTimeText(game.onlinePlaySecs);

    if (game.totalPlaytime > 0) return betterTimeText(game.totalPlaytime);

    return "0h 0m";
  };

  const playSecs = getPlayTime();

  return (
    <View className="mb-3 flex-row overflow-hidden rounded-xl bg-card">
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 80, height: 96 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-24 w-20 items-center justify-center bg-card">
          <Text className="text-neutral-500">No image</Text>
        </View>
      )}

      <View className="flex-1 justify-between p-3">
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
  );
};

export default CollectionCard;
