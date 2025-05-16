import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookCard } from "./book-card";
import { Book } from "@/db/schema";

export function BooksCarousel({ books } : { books: Book[] }) {
  return (
    <ScrollArea className="w-full pb-6 overflow-visible">
      <div className="flex space-x-6 p-2">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}