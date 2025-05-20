"use client";

import { getBooksPaginated } from "@/actions/book-actions";
import { useInView } from "react-intersection-observer";

import { useEffect, useState } from "react";
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
}

export function BookGrid({
  initialBooks,
  initialHasMore,
  searchTerm,
}: BookGridProps) {
  const [books, setBooks] = useState<BookResponseType>(initialBooks);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 300px 0px", // Cargar más libros antes de llegar al final
  });

  const loadMoreBooks = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getBooksPaginated(nextPage, 30, searchTerm);

      setBooks((prevBooks) => {
        if (!prevBooks) return result.data || [];
        if (!result.data) return prevBooks;

        // Usar un Map para eliminar duplicados basados en ID
        const uniqueBooks = new Map();

        prevBooks.forEach((book) => uniqueBooks.set(book.id, book));

        result.data.forEach((book) => uniqueBooks.set(book.id, book));

        return Array.from(uniqueBooks.values());
      });

      setHasMore(result?.hasMore ?? false);
      setPage(nextPage);
    } catch (error) {
      console.error("Error cargando más libros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMoreBooks();
    }
  }, [inView]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
