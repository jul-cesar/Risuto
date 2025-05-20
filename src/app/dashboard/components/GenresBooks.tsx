import { MoveRight } from "lucide-react";
import Link from "next/link";
import { BooksCarousel } from "./books/book-carousel";
import { BooksCarouselSkeleton } from "./books/trendings-skeleton";
import { EmptyState } from "./empty-state";

export function GenresBooks({
  books,
  isLoading,
  genreName,
  genreId,
}: {
  books: any[];
  isLoading: boolean;
  genreId?: string;
  genreName: string;
}) {
  const exploreUrl = genreId && `/books?genre=${genreId}`;
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex justify-between w-full items-center text-sm space-x-1">
          <p>{genreName}</p>
          <Link href={exploreUrl ?? ""} className="flex items-center space-x-1">
            <span> See all</span> <MoveRight className="w-4 h-4" />
          </Link>
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
