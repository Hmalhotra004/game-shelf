import { collection, dlc } from "@/db/schema";
import { GameType } from "@repo/schemas/types/index";
import { alias } from "drizzle-orm/pg-core";

// Parent game of a DLC. Join as: .leftJoin(parentCollection, eq(dlc.collectionId, parentCollection.id))
export const parentCollection = alias(collection, "parent_collection");

// Columns needed to resolve the Game/DLC that a completion or playthrough
// points at. Use with leftJoin on collection, dlc and parentCollection.
export const targetSelect = {
  gameId: collection.id,
  gameName: collection.name,
  gameImage: collection.image,
  gameCustomImage: collection.customImage,
  dlcId: dlc.id,
  dlcName: dlc.name,
  dlcImage: dlc.image,
  dlcCustomImage: dlc.customImage,
  dlcCollectionId: dlc.collectionId,
  parentName: parentCollection.name,
};

export type TargetRow = {
  gameType: GameType;
  gameId: string | null;
  gameName: string | null;
  gameImage: string | null;
  gameCustomImage: string | null;
  dlcId: string | null;
  dlcName: string | null;
  dlcImage: string | null;
  dlcCustomImage: string | null;
  dlcCollectionId: string | null;
  parentName: string | null;
};

// A DLC is shown under its own name, but navigates to its parent game.
// Returns null when the target row no longer resolves.
export const resolveTarget = (row: TargetRow) => {
  const isDlc = row.gameType === "DLC";
  const collectionId = isDlc ? row.dlcCollectionId : row.gameId;
  const targetId = isDlc ? row.dlcId : row.gameId;
  const name = isDlc ? row.dlcName : row.gameName;

  if (!collectionId || !targetId || !name) return null;

  return {
    gameType: row.gameType,
    name,
    parentName: isDlc ? row.parentName : null,
    image: isDlc
      ? (row.dlcCustomImage ?? row.dlcImage)
      : (row.gameCustomImage ?? row.gameImage),
    collectionId,
    targetId,
  };
};
