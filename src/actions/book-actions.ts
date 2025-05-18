"use server";

import { db } from "@/db";
import { Book, BookGenres, Books, Genres, ListBooks } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { response } from "./lists-actions";

export const getTrendingBooks = async (): Promise<response<Book[]>> => {
  try {
    const books = await db.query.Books.findMany({
      where: (Books, { eq }) => eq(Books.is_trending, true),
    });
    return {
      success: true,
      message: "Trending books retrieved successfully",
      data: books,
    };
  } catch (error: unknown) {
    console.error(
      "Error retrieving trending books:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message:
        "An unexpected error occurred while retrieving the trending books",
    };
  }
};

export const addBookToList = async (
  listId: string,
  bookId: string
): Promise<response<void>> => {
  try {
    const alreadyInList = await db.query.ListBooks.findFirst({
      where: (ListBooks, { eq }) => eq(ListBooks.list_id, listId),
    });
    if (alreadyInList) {
      return {
        success: false,
        message: "Book already in list",
      };
    }

    await db.insert(ListBooks).values({
      list_id: listId,
      book_id: bookId,
    });
    return {
      success: true,
      message: "Book added to list",
    };
  } catch (error: unknown) {
    console.error(
      "Error adding book to list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while adding the book to the list",
    };
  }
};

export const getBooksFromList = async (listId: string): Promise<response<Book[]>> => {
  try {
    const books = await db
      .select({
        id: Books.id,
        title: Books.title,
        author: Books.author,
        synopsis: Books.synopsis,
        cover_url: Books.cover_url,
        createdAt: Books.createdAt,
        is_trending: Books.is_trending,
      })
      .from(ListBooks)
      .innerJoin(Books, eq(ListBooks.book_id, Books.id))
      .where(eq(ListBooks.list_id, listId))
      .orderBy(desc(Books.createdAt));
    return {
      success: true,
      message: "Books retrieved successfully",
      data: books,
    };
  } catch (error) {
    console.error(
      "Error retrieving books from list:",
      error instanceof Error ? error.message : error
    );
    throw new Error("An unexpected error occurred while retrieving the books");
  }
};

export const searchBooksInDb = async (
  searchTerm: string
): Promise<response<Book[]>> => {
  try {
    const searchTermLower = searchTerm.toLowerCase();

    const books = await db
      .select()
      .from(Books)
      .where(
        sql`lower(${Books.title}) LIKE ${`%${searchTermLower}%`} OR lower(${Books.author}) LIKE ${`%${searchTermLower}%`}`
      )
      

    return {
      success: true,
      message: "Books retrieved successfully",
      data: books,
    };
  } catch (error) {
    console.error(
      "Error searching for books:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while searching for books",
    };
  }
};


export const getBookGenres = async (bookId: string): Promise<response<{ genre: string }[]>> => {
  try {
    if (!bookId) {
      return {
        success: false,
        message: "Book ID is required",
      };
    }

    const genres = await db
      .select({
        genre: Genres.name,
      })
      .from(BookGenres)
      .innerJoin(Genres, eq(BookGenres.genre_id, Genres.id))
      .where(eq(BookGenres.book_id, bookId))
      .orderBy(desc(Genres.createdAt));

    return {
      success: true,
      message: genres.length > 0 ? "Genres retrieved successfully" : "No genres found for this book",
      data: genres,
    };
  } catch (error) {
    console.error(
      "Error retrieving book genres:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the genres",
    };
  }
};
