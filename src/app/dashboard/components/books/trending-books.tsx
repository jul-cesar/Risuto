"use server";

import { db } from "@/db";
import { Book, Books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EmptyState } from "../empty-state";
import { BooksCarousel } from "./book-carousel";

export async function TrendingBooks() {
  let books: Book[] = [];
  try {
    books = await db.query.Books.findMany({
      where: eq(Books.is_trending, true),
    });
  } catch (error) {
    console.error("Error fetching trending books:", error);
  }

  return (
    <section className="mb-12">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center space-x-1">
          <span>🔥 Trending books</span>
        </h2>
      </header>

      {books.length === 0 ? (
        <EmptyState message="No hay libros" height="h-48" />
      ) : (
        <BooksCarousel books={books} />
      )}
    </section>
  );
}
