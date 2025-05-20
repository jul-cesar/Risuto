"use server";

import { db } from "@/db";
import { Book, BookComment, BookComments, BookGenres, Books, Genres, ListBooks } from "@/db/schema";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
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
        publishedAt: Books.publishedAt,
        pagesInfo: Books.pagesInfo,
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

export const createCommentBook = async (
  text: string,
  commenterName: string,
  bookId: string,
  userId: string
): Promise<response<void>> => {
  try {
    if (!text || !commenterName || !bookId) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    await db.insert(BookComments).values({
      text,
      commenter_name: commenterName,
      book_id: bookId,
      user_id: userId,  
    });

    return {
      success: true,
      message: "Comment created successfully",
    };
  } catch (error) {
    console.error(
      "Error creating comment:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while creating the comment",
    };
  }
}

export const getBookComments = async (bookId: string): Promise<response<BookComment[]>> => {
  try {
    if (!bookId) {
      return {
        success: false,
        message: "Book ID is required",
      };
    }

    const comments = await db
      .select()
      .from(BookComments)
      .where(eq(BookComments.book_id, bookId))
      .orderBy(desc(BookComments.createdAt));

    return {
      success: true,
      message: comments.length > 0 ? "Comments retrieved successfully" : "No comments found for this book",
      data: comments,
    };
  } catch (error) {
    console.error(
      "Error retrieving book comments:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the comments",
    };
  }
};


export async function getRelatedBooks(bookId: string) {
  try {
    if (!bookId) {
      return {
        success: false,
        message: "Book ID is required",
      };
    }

    // Primero, obtener los géneros del libro base
    const bookGenres = await db
      .select({ genre_id: BookGenres.genre_id })
      .from(BookGenres)
      .where(eq(BookGenres.book_id, bookId));

    const genreIds = bookGenres.map(bg => bg.genre_id);

    if (genreIds.length === 0) {
      return {
        success: false,
        message: "No genres found for the given book",
        data: [],
      };
    }

    // Buscar libros que comparten géneros con el libro base
   
    const relatedBooksWithCount = await db
      .select({
        book_id: Books.id,
        title: Books.title,
        author: Books.author,
        synopsis: Books.synopsis,
        cover_url: Books.cover_url,
        createdAt: Books.createdAt,
        is_trending: Books.is_trending,
        publishedAt: Books.publishedAt,
        pagesInfo: Books.pagesInfo,
        genreCount: sql`COUNT(DISTINCT ${BookGenres.genre_id})`.as('genreCount')
      })
      .from(Books)
      .innerJoin(BookGenres, eq(Books.id, BookGenres.book_id))
      .where(
        and(
          ne(Books.id, bookId),
          inArray(BookGenres.genre_id, genreIds)
        )
      )
      .groupBy(Books.id)
      .having(sql`COUNT(DISTINCT ${BookGenres.genre_id}) >= 3`) // Al menos 3 géneros coincidentes
      .orderBy(sql`genreCount DESC`, desc(Books.createdAt)) // Primero por número de coincidencias, luego por fecha
      .limit(30);

    return {
      success: true,
      message: relatedBooksWithCount.length > 0 
        ? "Related books retrieved successfully" 
        : "No books with at least 3 matching genres found",
      data: relatedBooksWithCount,
    };
  } catch (error) {
    console.error(
      "Error retrieving related books:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while retrieving related books",
    };
  }
}


export const deleteBookComment = async (commentId: string, userId:string): Promise<response<void>> => {
  try {
    if (!commentId || !userId) {
      return {
        success: false,
        message: "Comment ID and User ID are required",
      };
    }

    const comment = await db.query.BookComments.findFirst({
      where: (BookComments, { eq }) => eq(BookComments.id, commentId),
    });

    if (!comment) {
      return {
        success: false,
        message: "Comment not found",
      };
    }

    if (comment.user_id !== userId) {
      return {
        success: false,
        message: "You do not have permission to delete this comment",
      };
    }

    await db.delete(BookComments).where(eq(BookComments.id, commentId));

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error(
      "Error deleting comment:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while deleting the comment",
    };
  }
}

export const editBookComment = async (
  commentId: string,
  userId: string,
  newText: string
): Promise<response<void>> => {
  try {
    if (!commentId || !userId || !newText) {
      return {
        success: false,
        message: "Comment ID, User ID, and new text are required",
      };
    }

    const comment = await db.query.BookComments.findFirst({
      where: (BookComments, { eq }) => eq(BookComments.id, commentId),
    });

    if (!comment) {
      return {
        success: false,
        message: "Comment not found",
      };
    }

    if (comment.user_id !== userId) {
      return {
        success: false,
        message: "You do not have permission to edit this comment",
      };
    }

    await db
      .update(BookComments)
      .set({ text: newText })
      .where(eq(BookComments.id, commentId));

    return {
      success: true,
      message: "Comment edited successfully",
    };
  } catch (error) {
    console.error(
      "Error editing comment:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while editing the comment",
    };
  }
}

