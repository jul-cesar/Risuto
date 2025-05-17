"use server";

import { db } from "@/db";
import { Book, ListBooks } from "@/db/schema";
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
