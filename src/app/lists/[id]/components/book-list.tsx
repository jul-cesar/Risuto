import { Book } from "@/db/schema";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookCard } from "@/app/dashboard/components/books/book-card";

interface BookListProps {
  books: Book[];
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
          {books.map((book : Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
