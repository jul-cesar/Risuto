import { EmptyState } from "../empty-state";
import { Book } from "@/db/schema";
import { BooksCarousel } from "./book-carousel";

export function TrendingBooks({ books } : { books: Book[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm space-x-1">
          <span>🔥 Trending books</span>
        </div>
      </div>

      {books.length === 0 ? (
        <EmptyState message="No hay libros" height="h-48" />
      ) : (
        <BooksCarousel books={books} />
      )}
    </section>
  );
}

