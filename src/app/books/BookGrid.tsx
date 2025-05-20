"use client";

import { getBooksPaginated } from "@/actions/book-actions";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { BookCard } from "./BookCard";

type BookResponseType =
  | {
      genres: {
        id: string;
        name: string;
      }[];
      id: string;
      title: string;
      author: string;
      synopsis: string;
      pagesInfo: string | null;
      cover_url: string;
      is_trending: boolean | null;
    }[]
  | undefined;

interface BookGridProps {
  initialBooks: BookResponseType;
  initialHasMore: boolean;
  searchTerm?: string;
  genreId?: string;
  isLoading?: boolean;
}

export function BookGrid({
  initialBooks,
  initialHasMore,
  searchTerm,
  genreId,
  isLoading: isQueryLoading = false,
}: BookGridProps) {
  const [books, setBooks] = useState<BookResponseType>(initialBooks);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 300px 0px",
  });

  // Reset state when search parameters change
  useEffect(() => {
    setBooks(initialBooks);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialBooks, initialHasMore, searchTerm, genreId]);

  const loadMoreBooks = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getBooksPaginated(nextPage, 10, searchTerm, genreId);

      setBooks((prevBooks) => {
        if (!prevBooks) return result.data || [];
        if (!result.data) return prevBooks;

        // Use a Map to remove duplicates based on ID
        const uniqueBooks = new Map();

        prevBooks.forEach((book) => uniqueBooks.set(book.id, book));
        result.data.forEach((book) => uniqueBooks.set(book.id, book));

        return Array.from(uniqueBooks.values());
      });

      setHasMore(result?.hasMore ?? false);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMoreBooks();
    }
  }, [inView]);

  // Show empty state when no books are found
  if (books?.length === 0 && !isLoading && !isQueryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-4xl">📚</div>
        <h3 className="mb-2 text-xl font-semibold">No se encontraron libros</h3>
        <p className="text-gray-500">
          {searchTerm
            ? `No hay resultados para "${searchTerm}"`
            : "No hay libros disponibles en este momento"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Loading indicator during initial search */}
      {isQueryLoading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            <span className="text-sm text-gray-500">Buscando libros...</span>
          </div>
        </div>
      )}

      {/* Book grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {books?.map((book) => (
          <BookCard key={book?.id} book={book} genres={book.genres} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
              <span className="text-sm text-gray-500">
                Cargando más libros...
              </span>
            </div>
          )}
        </div>
      )}

      {!hasMore && books?.length && books.length > 0 && (
        <p className="py-4 text-center text-sm text-gray-500">
          No hay más libros para mostrar
        </p>
      )}
    </div>
  );
}
