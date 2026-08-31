// import { sql } from "drizzle-orm";
// import { nanoid } from "nanoid";

// import {
//   check,
//   index,
//   integer,
//   pgTable,
//   text,
//   timestamp,
//   unique,
// } from "drizzle-orm/pg-core";

// export const gameRecord = pgTable(
//   "game_record",
//   {
//     id: text("id")
//       .primaryKey()
//       .$defaultFn(() => nanoid()),

//     type: syncType("type").notNull(),

//     dateUnlocked: timestamp("date_unlocked", {
//       mode: "date",
//     }).notNull(),

//     hoursSpent: integer("hours_spent").notNull().default(0),

//     collectionId: text("collection_id")
//       .notNull()
//       .references(() => collection.id, { onDelete: "cascade" }),

//     userId: text("user_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),

//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("updated_at")
//       .defaultNow()
//       .$onUpdate(() => new Date())
//       .notNull(),
//   },
//   (table) => [
//     index("game_record_user_idx").on(table.userId),
//     index("game_record_collection_idx").on(table.collectionId),

//     unique("game_record_unique").on(
//       table.userId,
//       table.collectionId,
//       table.type,
//     ),

//     check("game_record_hours_non_negative", sql`${table.hoursSpent} >= 0`),
//   ],
// );

// export const syncStatus = pgTable(
//   "sync_status",
//   {
//     id: text("id")
//       .primaryKey()
//       .$defaultFn(() => nanoid()),

//     type: syncType("sync_type").notNull(),
//     status: syncTypeStatus("sync_type_status").notNull(),

//     startedAt: timestamp("started_at").notNull(),
//     finishedAt: timestamp("finished_at"),

//     userId: text("user_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),

//     createdAt: timestamp("created_at").notNull().defaultNow(),
//     updatedAt: timestamp("updated_at")
//       .notNull()
//       .defaultNow()
//       .$onUpdateFn(() => new Date()),
//   },
//   (table) => [
//     index("sync_user_type_idx").on(table.userId, table.type),
//     index("sync_user_idx").on(table.userId),

//     unique("sync_user_type_unique").on(table.userId, table.type),
//   ],
// );
