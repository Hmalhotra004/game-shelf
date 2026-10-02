import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchGameClientResponse } from "@repo/schemas/types/igdb";
import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type Game = SearchGameClientResponse[number];

interface Props {
  game: Game;
  selected: boolean;
  onPress: (id: number) => void;
  onAddToWishlist: (game: Game) => void;
  onAddToCollection: (game: Game) => void;
}

const GameSearchCard = ({
  game,
  selected,
  onPress,
  onAddToWishlist,
  onAddToCollection,
}: Props) => {
  return (
    <Pressable
      onPress={() => onPress(game.id)}
      className={cn(
        "mb-3 overflow-hidden rounded-xl border bg-card",
        selected ? "border-primary" : "border-border",
      )}
    >
      <View className="flex-row gap-3 p-2 items-center">
        <Image
          source={game.coverUrl ? { uri: game.coverUrl } : undefined}
          style={{ width: 64, height: 86, borderRadius: 8 }}
          contentFit="cover"
          transition={150}
        />

        <View className="flex-1 justify-center gap-1.5">
          <Text
            numberOfLines={2}
            className="text-base font-semibold text-foreground"
          >
            {game.name}
          </Text>

          <Text className="text-sm text-muted-foreground">
            {game.releaseYear ?? "TBA"}
          </Text>

          {(game.isDLC || game.isBundle) && (
            <View className="flex-row gap-2">
              {game.isDLC && (
                <Badge variant="secondary">
                  <Text className="text-foreground">DLC</Text>
                </Badge>
              )}
              {game.isBundle && (
                <Badge variant="secondary">
                  <Text className="text-foreground">Bundle</Text>
                </Badge>
              )}
            </View>
          )}
        </View>
      </View>

      {selected && (
        <View className="flex-row gap-2 px-2 pb-2">
          <Button
            variant="outline"
            onPress={() => onAddToWishlist(game)}
            disabled={true}
            className="flex-1"
          >
            <Text className="text-foreground">Add to Wishlist</Text>
          </Button>

          <Button
            onPress={() => onAddToCollection(game)}
            className="flex-1"
          >
            <Text className="text-primary-foreground">Add to Collection</Text>
          </Button>
        </View>
      )}
    </Pressable>
  );
};

export default memo(GameSearchCard);
