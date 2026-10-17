import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { CompletionGetMany } from "@repo/schemas/types/completion";
import { betterTimeText } from "@repo/utils/lib/utils";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import CompletionCardContextMenu from "./CardContextMenu";

import {
  CalendarCheckIcon,
  ClockIcon,
  ImageIcon,
  PackagePlusIcon,
  TrophyIcon,
} from "lucide-react-native";

interface Props {
  completion: CompletionGetMany;
}

const CARD_HEIGHT = 124;
const IMAGE_SIZE = 100;

const formatDate = (value: string | Date | null) => {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const CompletionCard = ({ completion }: Props) => {
  const theme = useThemeStore((s) => s.theme);
  const mutedColor = THEME[theme].mutedForeground;

  const imageUri = completion.customImage ?? completion.image;
  const isDlc = completion.gameType === "DLC";

  const title =
    isDlc && completion.dlcName ? completion.dlcName : completion.name;
  const subtitle = isDlc ? completion.name : null;

  const playTime =
    completion.totalPlaytime && completion.totalPlaytime > 0
      ? betterTimeText(completion.totalPlaytime)
      : "—";

  return (
    <CompletionCardContextMenu completion={completion}>
      <Pressable
        className="flex-row overflow-hidden rounded-2xl border border-border bg-card active:scale-[0.99] active:opacity-90"
        style={{
          height: CARD_HEIGHT,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
      >
        {/* Square cover with a trophy badge */}
        <View style={{ width: IMAGE_SIZE, height: CARD_HEIGHT }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: IMAGE_SIZE, height: CARD_HEIGHT }}
              contentFit="cover"
              transition={250}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-muted">
              <ImageIcon
                color={mutedColor}
                size={30}
              />
            </View>
          )}

          <View className="absolute left-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/65">
            <TrophyIcon
              color="#facc15"
              size={13}
            />
          </View>
        </View>

        {/* Details */}
        <View className="flex-1 justify-between px-3 py-2.5">
          <View className="gap-1">
            <View className="flex-row items-center justify-between gap-2">
              <Text
                className="flex-1 text-base font-bold leading-tight"
                numberOfLines={1}
              >
                {title}
              </Text>

              {isDlc && (
                <Badge
                  variant="secondary"
                  className="rounded-md px-1.5 py-0.5"
                >
                  <View className="flex-row items-center gap-1">
                    <PackagePlusIcon
                      color={mutedColor}
                      size={10}
                    />
                    <Text className="text-2xs font-semibold">DLC</Text>
                  </View>
                </Badge>
              )}
            </View>

            {subtitle ? (
              <Text
                className="text-xs text-muted-foreground"
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}

            <View className="flex-row items-center gap-1.5 pt-0.5">
              <Badge variant="outline">
                <Text className="text-2xs font-semibold">
                  {completion.completionStyle}
                </Text>
              </Badge>
              <Text
                className="text-2xs font-medium text-muted-foreground"
                numberOfLines={1}
              >
                {completion.platform}
              </Text>
            </View>

            {completion.notes ? (
              <Text
                className="text-xs italic text-muted-foreground"
                // numberOfLines={1}
              >
                {completion.notes}
              </Text>
            ) : null}
          </View>

          {/* Bottom: date + playtime */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <CalendarCheckIcon
                color={mutedColor}
                size={13}
              />
              <Text className="text-xs font-medium text-muted-foreground">
                {formatDate(completion.completedAt)}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <ClockIcon
                color={mutedColor}
                size={13}
              />
              <Text className="text-xs font-semibold text-foreground">
                {playTime}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </CompletionCardContextMenu>
  );
};

export default CompletionCard;
