import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { TrophiesType } from "@repo/schemas/types/trophies";
import { Image } from "expo-image";
import { EyeIcon, TrophyIcon } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable, View } from "react-native";

import {
  TROPHY_COLORS,
  formatCategory,
  formatUnlockedDate,
  getCategory,
} from "@repo/utils/lib/trophies";

interface Props {
  trophy: TrophiesType;
  isPS: boolean;
}

function TrophyItemBase({ trophy, isPS }: Props) {
  const [revealed, setRevealed] = useState(false);

  const { name, description, achieved, hidden, unlockTime, icon, iconGray } =
    trophy;

  const category = getCategory(trophy, isPS);
  const color = TROPHY_COLORS[category] ?? TROPHY_COLORS.Common;
  const isHidden = hidden && !achieved && !revealed;
  const uri = achieved ? icon : (iconGray ?? icon);

  return (
    <View
      className={cn(
        "mb-3 flex-row gap-3 rounded-xl border border-border bg-card p-3",
        !achieved && "opacity-80",
      )}
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          blurRadius={isHidden ? 20 : 0}
          transition={150}
          style={{
            width: 52,
            height: 52,
            borderRadius: 6,
          }}
        />
      ) : (
        <View className="size-[52px] items-center justify-center rounded-lg bg-muted">
          <TrophyIcon
            size={24}
            color={color}
          />
        </View>
      )}

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 font-semibold leading-tight"
            numberOfLines={2}
          >
            {isHidden ? "Hidden" : name}
          </Text>

          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${color}26` }}
          >
            <Text
              className="text-[11px] font-medium"
              style={{ color }}
            >
              {formatCategory(category)}
            </Text>
          </View>
        </View>

        {isHidden ? (
          <Pressable
            onPress={() => setRevealed(true)}
            hitSlop={8}
            className="flex-row items-center gap-1 self-start"
          >
            <EyeIcon
              size={14}
              color={color}
            />
            <Text className="text-xs text-muted-foreground">Tap to reveal</Text>
          </Pressable>
        ) : (
          <>
            {!!description && (
              <Text className="text-xs text-muted-foreground">
                {description}
              </Text>
            )}

            {achieved && !!unlockTime && (
              <Text className="text-[11px] text-success">
                Unlocked {formatUnlockedDate(unlockTime)}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const TrophyItem = memo(TrophyItemBase);
export default TrophyItem;
