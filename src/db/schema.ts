import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from "drizzle-orm";
import { integer, SQLiteColumn, sqliteTable, SQLiteTableWithColumns, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
  likes: many(Likes),
}));

export const Books = sqliteTable("books", {
  id: text().primaryKey().$defaultFn(() => createId()),
  title: text().notNull(),
  author: text().notNull(),
  synopsis: text().notNull(),
  publishedAt: text("published_at"),
  pagesInfo: text("pages_info"),
  cover_url: text().notNull(),
  is_trending: integer({ mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const Lists = sqliteTable("lists", {
  id: text().primaryKey().$defaultFn(() => createId()),
  user_id: text().notNull(),
  slug: text(),
  title: text().notNull(),
  description: text(),
  is_public: integer({ mode: "boolean" }).notNull(),
  comments_enabled: integer({ mode: "boolean" }).notNull(),
  organization_id: text(),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  
});

export const listRelations = relations(Lists, ({ one, many }) => ({
  user: one(Users, {
    fields: [Lists.user_id],
    references: [Users.id],
  }),
  likes: many(Likes),  
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

export const Genres = sqliteTable("genres", {
  id: text().primaryKey().$defaultFn(() => createId()),
  name: text().notNull().unique(), // Define el índice único aquí
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const genreRelations = relations(Genres, ({ many }) => ({
  books: many(BookGenres),
}));

export const BookGenres = sqliteTable("book_genres", {
  id: text().primaryKey().$defaultFn(() => createId()),
  book_id: text().notNull(),
  genre_id: text().notNull(),
  addedAt: text("added_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const bookGenresRelations = relations(BookGenres, ({ one }) => ({
  book: one(Books, {
    fields: [BookGenres.book_id],
    references: [Books.id],
  }),
  genre: one(Genres, {
    fields: [BookGenres.genre_id],
    references: [Genres.id],
  }),
}));

export const BookComments = sqliteTable("book_comments", {
  id: text().primaryKey().$defaultFn(() => createId()),
  book_id: text().notNull(),
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

export const bookCommentRelations = relations(BookComments, ({ one }) => ({
  book: one(Books, {
    fields: [BookComments.book_id],
    references: [Books.id],
  }),
}));

export const Likes = sqliteTable("likes", {
  id: text().primaryKey().$defaultFn(() => createId()),
  user_id: text().notNull(),
  list_id: text().notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const likeRelations = relations(Likes, ({ one }) => ({
  user: one(Users, {
    fields: [Likes.user_id],
    references: [Users.id],
  }),
  list: one(Lists, {
    fields: [Likes.list_id],
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

export type Genre = typeof Genres.$inferSelect;
export type NewGenre = typeof Genres.$inferInsert;

export type BookGenre = typeof BookGenres.$inferSelect;
export type NewBookGenre = typeof BookGenres.$inferInsert;

export type BookComment = typeof BookComments.$inferSelect;
export type NewBookComment = typeof BookComments.$inferInsert;

export type Like = typeof Likes.$inferSelect;
export type NewLike = typeof Likes.$inferInsert;

