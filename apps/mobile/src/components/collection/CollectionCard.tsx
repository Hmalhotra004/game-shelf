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

const CARD_HEIGHT = 112;
const IMAGE_WIDTH = 88;

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CollectionCard = ({ game }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const imageUri = game.customImage ?? game.image;
  const router = useRouter();

  const isOnline = game.status === "Online";

  const getPlayTime = () => {
    if (isOnline) return betterTimeText(game.onlinePlaySecs);

    if (game.totalPlaytime > 0) return betterTimeText(game.totalPlaytime);

    return "0h 0m";
  };

  const playTime = getPlayTime();
  const mutedColor = THEME[theme].mutedForeground;

  return (
    <CollectionCardContextMenu game={game}>
      <Pressable
        className="flex-row overflow-hidden rounded-2xl border border-border bg-card active:opacity-80"
        style={{
          height: CARD_HEIGHT,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
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
              transition={200}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-muted">
              <ImageIcon
                color={THEME[theme].foreground}
                size={32}
              />
            </View>
          )}
        </View>

        {/* Details */}
        <View className="flex-1 justify-between px-3 py-2.5">
          {/* Top: title + platform/status */}
          <View className="gap-1.5">
            <Text
              className="text-base font-bold leading-tight"
              numberOfLines={1}
            >
              {game.name}
            </Text>

            <View className="flex-row items-center gap-1.5">
              <Badge variant="secondary">
                <Text className="text-2xs font-medium text-muted-foreground">
                  {game.platform}
                </Text>
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "",
                  statusColorMap[game.status].bg,
                  statusColorMap[game.status].border,
                )}
              >
                <Text className={cn("text-2xs font-medium")}>
                  {game.status}
                </Text>
              </Badge>
            </View>
          </View>

          {/* Bottom: stats */}
          <View className="flex-row items-center justify-between border-t border-border/60 pt-2">
            <View className="flex-row items-center gap-1">
              <ClockIcon
                color={mutedColor}
                size={13}
              />
              <Text className="text-xs font-medium text-muted-foreground">
                {playTime}
              </Text>
            </View>

            <View className="flex-row items-center gap-2.5">
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

            <View className="flex-row items-center">
              <IndianRupeeIcon
                color={mutedColor}
                size={13}
              />
              <Text className="text-xs font-semibold text-foreground">
                {formatAmount(game.totalAmount)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </CollectionCardContextMenu>
  );
};

export default CollectionCard;
