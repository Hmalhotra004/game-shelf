import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { GameType, playthroughStatus } from "./enums";
import { collection, dlc, user } from "./index";

import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const playthrough = pgTable(
  "playthrough",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    startedAt: timestamp("started_at", { mode: "date" }).defaultNow(),
    finishedAt: timestamp("finished_at", { mode: "date" }),

    status: playthroughStatus("status").notNull().default("Active"),

    totalSeconds: integer("total_seconds").notNull().default(0),

    gameType: GameType("game_type").notNull().default("Game"),
    notes: text("notes"),

    collectionId: text("collection_id").references(() => collection.id, {
      onDelete: "cascade",
    }),

    dlcId: text("dlc_id").references(() => dlc.id, {
      onDelete: "cascade",
    }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("playthrough_user_idx").on(table.userId),
    index("playthrough_collection_idx").on(table.collectionId),
    index("playthrough_status_idx").on(table.status),

    check(
      "playthrough_game_or_dlc_check",
      sql`
    (${table.gameType} = 'Game' AND ${table.collectionId} IS NOT NULL AND ${table.dlcId} IS NULL)
    OR
    (${table.gameType} = 'DLC' AND ${table.dlcId} IS NOT NULL AND ${table.collectionId} IS NULL)
  `,
    ),
  ],
);

export const playthroughSession = pgTable(
  "playthrough_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    playDate: timestamp("play_date", { mode: "date" }).notNull(),
    secondsPlayed: integer("seconds_played").notNull(),

    playthroughId: text("playthrough_id")
      .notNull()
      .references(() => playthrough.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("session_playthrough_idx").on(table.playthroughId),
    index("session_user_idx").on(table.userId),
  ],
);
