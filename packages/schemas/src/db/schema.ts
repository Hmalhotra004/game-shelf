import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Enums
export const GameType = pgEnum("game_type", ["Game", "DLC"]);
export const platform = pgEnum("platform", ["PS", "PC"]);
export const PSVersion = pgEnum("ps_version", ["PS4", "PS5"]);

export const provider = pgEnum("provider", [
  "PSN",
  "Physical",
  "Steam",
  "Epic",
]);

export const ownershipType = pgEnum("ownership_type", [
  "Free",
  "Gift",
  "Bought",
  "Rented",
  "PS+",
  "Steam Family",
  "Game Pass",
]);

export const playthroughStatus = pgEnum("playthrough_status", [
  "Active",
  "On Hold",
  "Archived",
]);

export const status = pgEnum("status", [
  "Online",
  "Backlog",
  "Playing",
  "On Hold",
  "Dropped",
  "Story Completed",
  "Platinum",
  "Platinum+",
  "100% Completed",
]);

export const completionStyle = pgEnum("completion_style", [
  "Speed Run",
  "Story",
  "Story + Some Extras",
  "Story + Lots of Extras",
  "Completionated",
  "NG+ Run",
  "Challenge Run",
  "Achievement Run",
]);

export const userAccount = pgEnum("UserAccount", ["User", "Admin"]);

export const gameRecordType = pgEnum("game_record_type", [
  "PLATINUM",
  "MASTERED",
]);

export const syncType = pgEnum("sync_type", [
  "MASTERED_GAMES",
  "PLATINUMED_GAMES",
]);

export const syncTypeStatus = pgEnum("sync_type_status", [
  "Failed",
  "Running",
  "Completed",
]);

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tables
export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  steamId: text("steam_id"),
  PSNAccountUserName: text("psn_account_user_name"),
  PSNAccountId: text("psn_account_id"),
  userAccountType: userAccount("user_account").notNull().default("User"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const collection = pgTable(
  "collection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    name: text("name").notNull(),
    dateOfPurchase: timestamp("date_of_purchase", { mode: "date" }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).default("0.00"),
    image: text("image"),
    customImage: text("custom_image"),
    coverImage: text("cover_image"),
    customCoverImage: text("custom_cover_image"),
    completions: integer("completions").notNull().default(0),
    platform: platform("platform").notNull().default("PS"),
    provider: provider("provider").notNull().default("PSN"),
    PSVersion: PSVersion("ps_version"),
    status: status("status").notNull().default("Backlog"),
    dlcCount: integer("dlc_count").notNull().default(0),
    ownershipType: ownershipType("ownership_type").notNull().default("Bought"),
    hidden: boolean("hidden").default(false),
    edition: text("edition"),

    npCommunicationId: text("np_communication_id"),
    steamAppId: text("steam_app_id"),

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
    index("collection_user_idx").on(table.userId),
    index("collection_platform_idx").on(table.platform),
    index("collection_provider_idx").on(table.provider),

    check(
      "provider_platform_check",
      sql`
      (${table.platform} = 'PS' AND ${table.provider} IN ('PSN', 'Physical'))
      OR
      (${table.platform} = 'PC' AND ${table.provider} IN ('Steam', 'Epic'))
      `,
    ),

    check(
      "ps_version_only_for_ps",
      sql`
      (${table.platform} = 'PS' AND ${table.PSVersion} IS NOT NULL)
      OR
      (${table.platform} != 'PS' AND ${table.PSVersion} IS NULL)
      `,
    ),

    unique("user_steam_game_unique").on(
      table.userId,
      table.steamAppId,
      table.provider,
    ),
  ],
);

export const dlc = pgTable(
  "dlc",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    name: text("name").notNull(),
    dateOfPurchase: timestamp("date_of_purchase", { mode: "date" }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).default("0.00"),
    image: text("image"),
    coverImage: text("cover_image"),
    completions: integer("completions").notNull().default(0),
    status: status("status").notNull().default("Backlog"),
    ownershipType: ownershipType("ownership_type").notNull().default("Bought"),
    hidden: boolean("hidden").default(false),

    npCommunicationId: text("np_communication_id"),
    steamAppId: text("steam_app_id"),

    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
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
    index("dlc_collection_idx").on(table.collectionId),
    index("dlc_user_idx").on(table.userId),
  ],
);

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

export const completion = pgTable(
  "completion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    gameType: GameType("game_type").notNull().default("Game"),
    totalPlaytime: integer("total_playtime").default(0),
    completedAt: timestamp("completed_at", { mode: "date" }),
    notes: text("notes"),
    completionStyle: completionStyle("completion_style")
      .notNull()
      .default("Story"),

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
    index("completion_user_idx").on(table.userId),
    index("completion_collection_idx").on(table.collectionId),
    index("completion_dlc_idx").on(table.dlcId),

    check(
      "completion_game_or_dlc_check",
      sql`
        (${table.gameType} = 'Game' AND ${table.collectionId} IS NOT NULL AND ${table.dlcId} IS NULL)
        OR
        (${table.gameType} = 'DLC' AND ${table.dlcId} IS NOT NULL AND ${table.collectionId} IS NULL)
      `,
    ),
  ],
);

export const list = pgTable(
  "list",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    name: text("name").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("list_user_idx").on(table.userId)],
);

export const listItem = pgTable(
  "list_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    listId: text("list_id")
      .notNull()
      .references(() => list.id, { onDelete: "cascade" }),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("list_item_list_idx").on(table.listId),
    index("list_item_collection_idx").on(table.collectionId),

    // enforce uniqueness → cannot add same game twice to same list
    unique("list_collection_unique").on(table.listId, table.collectionId),
  ],
);

export const gameRecord = pgTable(
  "game_record",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    type: gameRecordType("type").notNull(),

    dateUnlocked: timestamp("date_unlocked", {
      mode: "date",
    }).notNull(),

    hoursSpent: integer("hours_spent").notNull().default(0),

    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),

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
    index("game_record_user_idx").on(table.userId),
    index("game_record_collection_idx").on(table.collectionId),

    unique("game_record_unique").on(
      table.userId,
      table.collectionId,
      table.type,
    ),

    check("game_record_hours_non_negative", sql`${table.hoursSpent} >= 0`),
  ],
);

export const syncStatus = pgTable(
  "sync_status",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    type: syncType("sync_type").notNull(),
    status: syncTypeStatus("sync_type_status").notNull(),

    startedAt: timestamp("started_at").notNull(),
    finishedAt: timestamp("finished_at"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("sync_user_type_idx").on(table.userId, table.type),
    index("sync_user_idx").on(table.userId),

    unique("sync_user_type_unique").on(table.userId, table.type),
  ],
);
