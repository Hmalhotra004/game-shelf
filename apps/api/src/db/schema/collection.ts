import { PSVersionTrophyType } from "@repo/schemas/types/index";
import { sql } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { PSVersion, ownershipType, platform, provider, status } from "./enums";
import { user } from "./user";

import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const collection = pgTable(
  "collection",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    name: text("name").notNull(),
    edition: text("edition"),
    dateOfPurchase: timestamp("date_of_purchase", { mode: "date" }),
    amount: numeric("amount", { precision: 10, scale: 2 }),

    image: text("image"),
    customImage: text("custom_image"),
    coverImage: text("cover_image"),
    customCoverImage: text("custom_cover_image"),

    ownershipType: ownershipType("ownership_type").notNull().default("Bought"),
    status: status("status").notNull().default("Backlog"),
    platform: platform("platform").notNull().default("PC"),
    provider: provider("provider").notNull().default("Steam"),
    PSVersion: PSVersion("ps_version").array().notNull().default([]),
    completions: integer("completions").notNull().default(0),
    dlcCount: integer("dlc_count").notNull().default(0),
    archived: boolean("archived").notNull().default(false),

    igdbId: text("igdbId").notNull(),
    npCommunicationIds: jsonb("np_communication_ids")
      .$type<Partial<Record<PSVersionTrophyType, string>>>()
      .notNull()
      .default({}),
    steamAppId: text("steam_app_id"),
    steamGridDBId: text("steam_grid_db_id"),

    userId: uuid("user_id")
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
      OR
      (${table.platform} = 'XBOX' AND ${table.provider} IN ('XBOX', 'Physical'))
      `,
    ),

    check(
      "ps_version_only_for_ps",
      sql`
      (${table.platform} = 'PS' AND cardinality(${table.PSVersion}) >= 1)
      OR
      (${table.platform} != 'PS' AND cardinality(${table.PSVersion}) = 0)
      `,
    ),

    unique("user_steam_game_unique").on(
      table.userId,
      table.steamAppId,
      table.provider,
    ),

    // in the collection table's constraints array
    check(
      "np_ids_is_object",
      sql`jsonb_typeof(${table.npCommunicationIds}) = 'object'`,
    ),

    // only PS3/PS4/PS5 keys allowed (no PS1/PS2/garbage)
    check(
      "np_ids_allowed_keys",
      sql`(${table.npCommunicationIds} - ARRAY['PS3','PS4','PS5']) = '{}'::jsonb`,
    ),

    // every key must also be a version the collection actually owns
    check(
      "np_ids_keys_in_ps_version",
      sql`(${table.npCommunicationIds} - ${table.PSVersion}::text[]) = '{}'::jsonb`,
    ),

    // non-PS collections can't have trophy IDs
    check(
      "np_ids_only_for_ps",
      sql`${table.platform} = 'PS' OR ${table.npCommunicationIds} = '{}'::jsonb`,
    ),

    // values must be strings shaped like NPWR12345_00
    check(
      "np_ids_value_format",
      sql`NOT jsonb_path_exists(
    ${table.npCommunicationIds},
    '$.* ? (@.type() != "string" || !(@ like_regex "^NPWR[0-9]{5}_[0-9]{2}$"))'
  )`,
    ),
  ],
);

export const dlc = pgTable(
  "dlc",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    name: text("name").notNull(),
    dateOfPurchase: timestamp("date_of_purchase", { mode: "date" }),
    amount: numeric("amount", { precision: 10, scale: 2 }),

    image: text("image"),
    customImage: text("custom_image"),
    coverImage: text("cover_image"),
    customCoverImage: text("custom_cover_image"),

    ownershipType: ownershipType("ownership_type").notNull().default("Bought"),
    status: status("status").notNull().default("Backlog"),

    completions: integer("completions").notNull().default(0),
    archived: boolean("archived").notNull().default(false),

    igdbId: text("igdbId").notNull(),
    steamAppId: text("steam_app_id"),
    steamGridDBId: text("steam_grid_db_id"),

    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
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
