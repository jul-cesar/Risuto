import type { Book } from "@/db/schema";
import { EmptyState } from "../empty-state";
import { BooksCarousel } from "./book-carousel";
import { BooksCarouselSkeleton } from "./trendings-skeleton";

export function TrendingBooks({
  books,
  isLoading,
}: {
  books: Book[];
  isLoading: boolean;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm space-x-1">
          <span>🔥 Trending books</span>
        </div>
      </div>

      {isLoading ? (
        <BooksCarouselSkeleton />
      ) : books.length === 0 ? (
        <EmptyState message="No hay libros" height="h-48" />
      ) : (
        <BooksCarousel books={books} />
      )}
    </section>
  );
}
