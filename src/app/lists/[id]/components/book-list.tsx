import { BookCard } from "@/app/dashboard/components/books/book-card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <h2 className="flex items-center text-lg mb-4">
          <span className="mr-2">📚</span> Books in this list
        </h2>
        <div className="h-40 flex items-center justify-center text-gray-400">
          No hay libros en esta lista
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="flex items-center text-lg mb-4">
        <span className="mr-2">📚</span> Books in this list
      </h2>
      <ScrollArea className="w-full pb-4 overflow-visible">
        <div className="flex space-x-6 p-4">
          {books.map((book) => (
            <BookCard key={book?.id} book={book} />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}
