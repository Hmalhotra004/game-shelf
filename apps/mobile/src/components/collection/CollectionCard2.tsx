import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { CollectionGetMany } from "@repo/schemas/types/collection";
import { betterTimeText, statusColorMap } from "@repo/utils/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import CollectionCardContextMenu from "./CollectionCardContextMenu";

import {
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  ImageIcon,
  IndianRupeeIcon,
} from "lucide-react-native";

interface Props {
  game: CollectionGetMany;
}

const CARD_HEIGHT = 124;
const IMAGE_WIDTH = 96;

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CollectionCard2 = ({ game }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const imageUri = game.customImage ?? game.image;
  const router = useRouter();

  const isOnline = game.status === "Online";
  const statusStyle = statusColorMap[game.status];

  const getPlayTime = () => {
    if (isOnline && game.onlinePlaySecs > 0)
      return betterTimeText(game.onlinePlaySecs);

    if (game.totalPlaytime > 0) return betterTimeText(game.totalPlaytime);

    return "0h 0m";
  };

  const playTime = getPlayTime();
  const mutedColor = THEME[theme].mutedForeground;

  return (
    <CollectionCardContextMenu game={game}>
      <Pressable
        className="flex-row overflow-hidden rounded-2xl border border-border bg-card active:scale-[0.99] active:opacity-90"
        style={{
          height: CARD_HEIGHT,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
        onPress={() =>
          router.push({
            pathname: "/(collection)/[collectionId]",
            params: { collectionId: game.id },
          })
        }
      >
        {/* Cover */}
        <View style={{ width: IMAGE_WIDTH, height: CARD_HEIGHT }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: IMAGE_WIDTH, height: CARD_HEIGHT }}
              contentFit="cover"
              transition={250}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-muted">
              <ImageIcon
                color={mutedColor}
                size={32}
              />
            </View>
          )}

          {/* Platform chip overlaid on the cover */}
          <View className="absolute bottom-1.5 left-1.5 right-1.5 items-start">
            <View className="rounded-md bg-black/65 px-1.5 py-0.5">
              <Text
                className="text-2xs font-semibold text-white"
                numberOfLines={1}
              >
                {game.platform}
              </Text>
            </View>
          </View>
        </View>

        {/* Status accent bar between cover and details */}
        {/* <View className={cn("border-l-2", statusStyle.border)} /> */}

        {/* Details */}
        <View className="flex-1 justify-between px-3 py-2.5">
          {/* Top: title + status */}
          <View className="gap-2">
            <Text
              className="text-base font-bold leading-tight"
              numberOfLines={1}
            >
              {game.name}
            </Text>

            <View className="flex-row">
              <Badge
                variant="outline"
                className={cn(statusStyle.bg, statusStyle.border)}
              >
                <Text className="text-2xs font-semibold">{game.status}</Text>
              </Badge>
            </View>
          </View>

          {/* Bottom: stats */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <ClockIcon
                  color={mutedColor}
                  size={13}
                />
                <Text className="text-xs font-medium text-muted-foreground">
                  {playTime}
                </Text>
              </View>

              {game.dlcCount > 0 && (
                <View className="flex-row items-center gap-1">
                  <DownloadIcon
                    color={mutedColor}
                    size={13}
                  />
                  <Text className="text-xs font-medium text-muted-foreground">
                    {game.dlcCount}
                  </Text>
                </View>
              )}

              {game.completions > 0 && (
                <View className="flex-row items-center gap-1">
                  <CheckIcon
                    color={mutedColor}
                    size={13}
                  />
                  <Text className="text-xs font-medium text-muted-foreground">
                    {game.completions}
                  </Text>
                </View>
              )}
            </View>

            <Badge
              variant="secondary"
              className="px-1.5 py-1 rounded-lg"
            >
              <View className="flex-row items-center gap-0.5">
                <IndianRupeeIcon
                  color={THEME[theme].foreground}
                  size={12}
                />
                <Text className="text-xs font-bold text-foreground">
                  {formatAmount(game.totalAmount)}
                </Text>
              </View>
            </Badge>
          </View>
        </View>
      </Pressable>
    </CollectionCardContextMenu>
  );
};

export default CollectionCard2;
