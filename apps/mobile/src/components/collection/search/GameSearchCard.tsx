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

const Badge = ({ label }: { label: string }) => (
  <View className="rounded-md bg-muted px-2 py-0.5">
    <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
  </View>
);

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
      className={`mb-3 overflow-hidden rounded-xl border bg-card ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <View className="flex-row gap-3 p-3">
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
              {game.isDLC && <Badge label="DLC" />}
              {game.isBundle && <Badge label="Bundle" />}
            </View>
          )}
        </View>
      </View>

      {selected && (
        <View className="flex-row gap-2 px-3 pb-3">
          <Pressable
            onPress={() => onAddToWishlist(game)}
            className="flex-1 items-center rounded-lg border border-border py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-medium text-foreground">
              Add to Wishlist
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onAddToCollection(game)}
            className="flex-1 items-center rounded-lg bg-primary py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-medium text-primary-foreground">
              Add to Collection
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

export default memo(GameSearchCard);
