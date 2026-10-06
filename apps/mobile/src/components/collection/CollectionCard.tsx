import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { betterTimeText } from "@repo/utils/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import CollectionCardContextMenu from "./CollectionCardContextMenu";

import {
  CheckIcon,
  DownloadIcon,
  ImageIcon,
  IndianRupeeIcon,
  PlayIcon,
} from "lucide-react-native";

interface Props {
  game: CollectionGetMany;
}

const CollectionCard = ({ game }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const imageUri = game.customImage ?? game.image;
  const router = useRouter();

  const getPlayTime = () => {
    if (game.status === "Online") return betterTimeText(game.onlinePlaySecs);

    if (game.totalPlaytime > 0) return betterTimeText(game.totalPlaytime);

    return "0h 0m";
  };

  const playSecs = getPlayTime();

  return (
    <CollectionCardContextMenu game={game}>
      <Pressable
        className="flex-row overflow-hidden rounded-xl bg-card"
        onPress={() =>
          router.push({
            pathname: "/(collection)/[collectionId]",
            params: { collectionId: game.id },
          })
        }
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 80, height: 100 }}
            contentFit="cover"
          />
        ) : (
          <ImageIcon
            color={THEME[theme].foreground}
            width={80}
            height={96}
          />
        )}

        <View className="flex-1 justify-between py-1 px-2.5">
          <View className="flex gap-px">
            <Text
              className="font-semibold"
              numberOfLines={1}
            >
              {game.name}
            </Text>

            <Text className="text-xs text-muted-foreground">
              {game.platform} · {game.status}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-row gap-1 items-center">
              <PlayIcon
                color={THEME[theme].mutedForeground}
                size={14}
              />
              <Text className="text-xs text-muted-foreground">{playSecs}</Text>
            </View>

            {/* middle */}
            <View className="flex-row items-center gap-2">
              {game.dlcCount > 0 && (
                <View className="flex-row gap-1 items-center">
                  <DownloadIcon
                    color={THEME[theme].mutedForeground}
                    size={14}
                  />
                  <Text className="text-xs text-muted-foreground">
                    {game.dlcCount > 0 && game.dlcCount}
                  </Text>
                </View>
              )}

              {game.completions > 0 && (
                <View className="flex-row gap-1 items-center">
                  <CheckIcon
                    color={THEME[theme].mutedForeground}
                    size={14}
                  />
                  <Text className="text-xs text-muted-foreground">
                    {game.completions > 0 && game.completions}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row gap-0.5 items-center">
              <IndianRupeeIcon
                color={THEME[theme].mutedForeground}
                size={14}
              />

              {/* TODO:format comma */}
              <Text className="text-xs text-muted-foreground">
                {game.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </CollectionCardContextMenu>
  );
};

export default CollectionCard;
