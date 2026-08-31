import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { collection, user } from "./index";

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
