import { BookCard } from "@/app/dashboard/components/books/book-card";

interface BookListProps {
  books: ({
    id: string;
    title: string;
    author: string;
    synopsis: string;
    cover_url: string;
    is_trending: boolean | null;
    createdAt: string;
  } | null)[];
}

export function BookList({ books }: BookListProps) {
  if (books.length === 0) {
    return (
      <section>
        <h2 className="flex items-center text-lg font-medium mb-4">
          <span className="mr-2">📚</span> Books in this list
        </h2>
        <div className="h-40 flex items-center justify-center text-gray-400">
          No hay libros en esta lista
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <h2 className="flex items-center text-lg font-medium mb-4">
        <span className="mr-2">📚</span> Books in this list
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {books.map(
          (book) =>
            book && (
              <div key={book.id} className="w-full">
                <BookCard book={book} />
              </div>
            )
        )}
      </div>
    </section>
  );
}
