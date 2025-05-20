"use client";

import { getBooksPaginated } from "@/actions/book-actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookGrid } from "./BookGrid";

interface BooksContainerProps {
  initialBooks: any[];
  initialHasMore: boolean;
  initialSearchTerm?: string;
  initialGenreId?: string;
}

export function BooksContainer({
  initialBooks,
  initialHasMore,
  initialSearchTerm,
  initialGenreId,
}: BooksContainerProps) {
  const [books, setBooks] = useState(initialBooks);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get("q") || "";
  const genreId = searchParams.get("genre") || "";

  // Create a unique key that changes when search parameters change
  const searchKey = `${searchTerm}-${genreId}`;

  // Effect to update books when search parameters change
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const { data: newBooks, hasMore: newHasMore } = await getBooksPaginated(
          1, // Reset to page 1 when search changes
          10,
          searchTerm || undefined,
          genreId || undefined
        );

        setBooks(newBooks || []);
        setHasMore(newHasMore || false);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch when searchTerm or genreId changes
    fetchBooks();
  }, [searchTerm, genreId]);

  return (
    <div>
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block px-4 py-2 bg-background-secondary rounded-md">
            Searching for "{searchTerm}"...
          </div>
        </div>
      )}

      {/* Add key prop to force BookGrid to re-mount when search changes */}
      <BookGrid
        key={searchKey}
        initialBooks={books}
        initialHasMore={hasMore}
        searchTerm={searchTerm || undefined}
        genreId={genreId || undefined}
      />
    </div>
  );
}
