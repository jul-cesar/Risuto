import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Users = sqliteTable("users", {
  id: text().primaryKey().$defaultFn(() => createId()),
  clerk_user_id: text().notNull(),
  name: text().notNull(),
  avatar_url: text(),
  bio: text().notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  email: text().notNull().unique(),
});



export const userRelations = relations(Users, ({ many }) => ({
  lists: many(Lists),
}));

export const Books = sqliteTable("books", {
  id: text().primaryKey().$defaultFn(() => createId()),
  title: text().notNull(),
  author: text().notNull(),
  synopsis: text().notNull(),
  cover_url: text().notNull(),
  is_trending: integer({ mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const Lists = sqliteTable("lists", {
  id: text().primaryKey().$defaultFn(() => createId()),
  user_id: text().notNull(),
  slug: text().default(sql`(lower(hex(randomblob(8))))`),
  title: text().notNull(),
  description: text().notNull(),
  is_public: integer({ mode: "boolean" }).notNull(),
  comments_enabled: integer({ mode: "boolean" }).notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const listRelations = relations(Lists, ({ one }) => ({
  user: one(Users, {
    fields: [Lists.user_id],
    references: [Users.id],
  }),
}));

export const ListBooks = sqliteTable("list_books", {
  id: text().primaryKey().$defaultFn(() => createId()),
  list_id: text().notNull(),
  book_id: text().notNull(),
  addedAt: text("added_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export const listBooksRelations = relations(ListBooks, ({ one }) => ({
  list: one(Lists, {
    fields: [ListBooks.list_id],
    references: [Lists.id],
  }),
  book: one(Books, {
    fields: [ListBooks.book_id],
    references: [Books.id],
  }),
}));

export const Comments = sqliteTable("comments", {
  id: text().primaryKey().$defaultFn(() => createId()),
  list_id: text().notNull(),
  commenter_name: text().notNull(),
  text: text().notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});
export const commentRelations = relations(Comments, ({ one }) => ({
  list: one(Lists, {
    fields: [Comments.list_id],
    references: [Lists.id],
  }),
}));

export type User = typeof Users.$inferSelect;
export type NewUser = typeof Users.$inferInsert;

export type Book = typeof Books.$inferSelect;
export type NewBook = typeof Books.$inferInsert;


export type List = typeof Lists.$inferSelect;
export type NewList = typeof Lists.$inferInsert;


export type ListBook = typeof ListBooks.$inferSelect;
export type NewListBook = typeof ListBooks.$inferInsert;

export type Comment = typeof Comments.$inferSelect;
export type NewComment = typeof Comments.$inferInsert;
