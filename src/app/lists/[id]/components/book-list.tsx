import { BookCard } from "@/app/dashboard/components/books/book-card";
import { SearchBooksModal } from "@/components/AddBooksModal";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

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
  listId: string;
}

export function BookList({ books, listId }: BookListProps) {
  if (books.length === 0) {
    return (
      <section>
        <h2 className="flex items-center text-lg font-medium mb-4">
          <span className="mr-2">📚</span> Books in this list
        </h2>
        <div className="h-40 flex gap-2 items-center justify-center text-gray-400">
          No hay libros en esta lista
          <SearchBooksModal
            listId={listId}
            trigger={<p className="underline cursor-pointer">Agregar libros</p>}
          />
        </div>
        <div className="text-sm text-gray-500">
          Agrega libros a tu lista para empezar a leer
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
        <SearchBooksModal
          listId={listId}
          trigger={
            <Card className="p-2 h-full flex flex-col transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer">
              <CardContent className="p-0 h-56  rounded-t-lg overflow-hidden relative">
                <div className="flex  flex-col gap-4 items-center justify-center h-full">
                  <p>Add a new book</p>
                  <Plus className="size-12 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          }
        />

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
