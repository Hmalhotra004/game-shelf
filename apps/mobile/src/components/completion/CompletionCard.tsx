import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { CompletionGetMany } from "@repo/schemas/types/completion";
import { betterTimeText } from "@repo/utils/lib/utils";
import { formatDate } from "date-fns";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import CompletionCardContextMenu from "./CardContextMenu";

import {
  CalendarCheckIcon,
  ClockIcon,
  ImageIcon,
  PackagePlusIcon,
} from "lucide-react-native";

interface Props {
  completion: CompletionGetMany;
}

const COVER_WIDTH = 92;
const MIN_HEIGHT = 128;

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
        className="flex-row overflow-hidden rounded-2xl border border-border bg-card active:opacity-90"
        style={{ minHeight: MIN_HEIGHT }}
      >
        {/* Cover: stretches to the card's height, so tall notes don't break it */}
        <View
          className="bg-muted"
          style={{ width: COVER_WIDTH }}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
              contentFit="cover"
              transition={250}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <ImageIcon
                color={mutedColor}
                size={30}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-1 gap-2 px-3 pb-2 pt-3">
            {/* Title */}
            <View className="gap-0.5">
              <View className="flex-row items-start gap-2">
                <Text
                  className="flex-1 text-base font-bold leading-tight"
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </View>

              {subtitle ? (
                <Text
                  className="text-xs text-muted-foreground"
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {/* Chips */}
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Badge variant="secondary">
                <Text className="text-2xs font-semibold">
                  {completion.completionStyle}
                </Text>
              </Badge>

              <Badge variant="outline">
                <Text className="text-2xs font-semibold">
                  {completion.platform}
                </Text>
              </Badge>

              {completion.PSVersion ? (
                <Badge variant="outline">
                  <Text className="text-2xs font-semibold">
                    {completion.PSVersion}
                  </Text>
                </Badge>
              ) : null}

              {isDlc ? (
                <Badge variant="outline">
                  <View className="flex-row items-center gap-1">
                    <PackagePlusIcon
                      color={mutedColor}
                      size={10}
                    />
                    <Text className="text-2xs font-semibold">DLC</Text>
                  </View>
                </Badge>
              ) : null}
            </View>

            {completion.notes?.trim() && (
              <Text className="flex-1 text-xs leading-snug text-muted-foreground">
                {completion.notes.trim()}
              </Text>
            )}
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between border-t border-border px-3 py-2">
            <View className="flex-row items-center gap-1.5">
              <CalendarCheckIcon
                color={mutedColor}
                size={13}
              />
              <Text className="text-xs font-medium text-muted-foreground">
                {completion.completedAt
                  ? formatDate(completion.completedAt, "PP")
                  : "—"}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <ClockIcon
                color={mutedColor}
                size={13}
              />
              <Text className="text-xs font-semibold text-muted-foreground">
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
