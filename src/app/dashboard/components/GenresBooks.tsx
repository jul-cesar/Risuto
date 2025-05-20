import { BooksCarousel } from "./books/book-carousel";
import { BooksCarouselSkeleton } from "./books/trendings-skeleton";
import { EmptyState } from "./empty-state";

export function GenresBooks({
  books,
  isLoading,
  genreName,
}: {
  books: any[];
  isLoading: boolean;
  genreName: string;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm space-x-1">
          <span>{genreName} books</span>
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
