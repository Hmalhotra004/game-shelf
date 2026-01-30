import { relations } from "drizzle-orm";

import {
  account,
  collection,
  completion,
  dlc,
  list,
  listItem,
  platinumList,
  playthrough,
  playthroughSession,
  session,
  user,
  verification,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  verifications: many(verification),

  collections: many(collection),
  dlcs: many(dlc),

  playthroughs: many(playthrough),
  playthroughSessions: many(playthroughSession),
  completions: many(completion),

  lists: many(list),
  platinumGames: many(platinumList),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verificationRelations = relations(verification, () => ({}));

export const collectionRelations = relations(collection, ({ one, many }) => ({
  user: one(user, {
    fields: [collection.userId],
    references: [user.id],
  }),

  dlcs: many(dlc),
  playthroughs: many(playthrough),
  completions: many(completion),

  listItems: many(listItem),
  platinumEntry: one(platinumList),
}));

export const dlcRelations = relations(dlc, ({ one, many }) => ({
  collection: one(collection, {
    fields: [dlc.collectionId],
    references: [collection.id],
  }),

  user: one(user, {
    fields: [dlc.userId],
    references: [user.id],
  }),

  playthroughs: many(playthrough),
  completions: many(completion),
}));

export const playthroughRelations = relations(playthrough, ({ one, many }) => ({
  user: one(user, {
    fields: [playthrough.userId],
    references: [user.id],
  }),

  collection: one(collection, {
    fields: [playthrough.collectionId],
    references: [collection.id],
  }),

  dlc: one(dlc, {
    fields: [playthrough.dlcId],
    references: [dlc.id],
  }),

  sessions: many(playthroughSession),
}));

export const playthroughSessionRelations = relations(
  playthroughSession,
  ({ one }) => ({
    playthrough: one(playthrough, {
      fields: [playthroughSession.playthroughId],
      references: [playthrough.id],
    }),

    user: one(user, {
      fields: [playthroughSession.userId],
      references: [user.id],
    }),
  }),
);

export const completionRelations = relations(completion, ({ one }) => ({
  user: one(user, {
    fields: [completion.userId],
    references: [user.id],
  }),

  collection: one(collection, {
    fields: [completion.collectionId],
    references: [collection.id],
  }),

  dlc: one(dlc, {
    fields: [completion.dlcId],
    references: [dlc.id],
  }),
}));

export const listRelations = relations(list, ({ one, many }) => ({
  user: one(user, {
    fields: [list.userId],
    references: [user.id],
  }),

  items: many(listItem),
}));

export const listItemRelations = relations(listItem, ({ one }) => ({
  list: one(list, {
    fields: [listItem.listId],
    references: [list.id],
  }),

  collection: one(collection, {
    fields: [listItem.collectionId],
    references: [collection.id],
  }),
}));

export const platinumListRelations = relations(platinumList, ({ one }) => ({
  user: one(user, {
    fields: [platinumList.userId],
    references: [user.id],
  }),

  collection: one(collection, {
    fields: [platinumList.collectionId],
    references: [collection.id],
  }),
}));
