"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { getBooksFromList, searchBooksInDb } from "@/actions/book-actions";
import { addBookToList } from "@/actions/lists-actions";
import { Book } from "@/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusCircle, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Tipo para los libros

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchBooksModal({
  trigger,
  listId,
}: {
  trigger: React.ReactNode;
  listId: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const router = useRouter();

  const { data: booksList } = useQuery({
    queryKey: ["booksList", listId],
    queryFn: async () => {
      const response = await getBooksFromList(listId);
      return response.data;
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const searchBooks = async () => {
      if (debouncedSearchTerm.trim() === "") {
        setBooks([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await searchBooksInDb(
          debouncedSearchTerm.toLowerCase()
        ); // Convierte el término a minúsculas
        if (response.success === false) {
          toast.error(response.message);
          return;
        }

        console.log("Books found:", response);

        setBooks(response.data || []);
      } catch (error) {
        console.error("Error searching books:", error);
        toast.error("No se pudieron cargar los libros. Intenta de nuevo.");
      } finally {
        setIsSearching(false);
      }
    };

    searchBooks();
  }, [debouncedSearchTerm]);

  const handleAddBook = async (book: Book) => {
    const add = await addBookToList(listId, book.id);
    if (!add.success) {
      toast.error(add.message);
      return;
    }
    queryClient.invalidateQueries(["booksList", listId]);
    toast.success(`"${book.title}" ha sido añadido a tu lista.`);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
        router.refresh(); // Refresca la página al abrir el modal
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl"> Search Books</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search by title, author..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {isSearching ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="flex cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="w-[80px] h-[120px] flex-shrink-0 bg-muted">
                    <img
                      src={book.cover_url || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-3">
                    <h3
                      className="font-medium line-clamp-1 underline"
                      onClick={() => {
                        window.open(`/books/${book.id}`, "_blank"); // Abre en una nueva ventana
                      }}
                    >
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {book.author}
                    </p>
                    <p className="text-xs line-clamp-2 mb-2 flex-1">
                      {book.synopsis}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        Libro
                      </Badge>
                      {!booksList?.some((b) => b.id === book.id) ? ( // Verifica si el libro ya está en la lista usando `some`
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => handleAddBook(book)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Añadir
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 bg-green-500 text-xs"
                        >
                          Already added
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : debouncedSearchTerm.trim() !== "" ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-2">📚</div>
              <h3 className="text-lg font-medium">
                No results found for "{debouncedSearchTerm}"
              </h3>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-lg font-medium">
                Search for books to add to your list
              </h3>
              <p className="text-muted-foreground">
                Write the title or author of the book you want to add.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
