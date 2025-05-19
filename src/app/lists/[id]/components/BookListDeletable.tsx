"use client";

import { deleteBookFromList } from "@/actions/lists-actions";
import { BookCard } from "@/app/dashboard/components/books/book-card";
import { SearchBooksModal } from "@/components/AddBooksModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover_url: string;
  is_trending: boolean | null;
  createdAt: string;
  publishedAt: string | null;
  pagesInfo: string | null;
}

interface BookListProps {
  books: (Book | null)[];
  listId: string;
  canDelete?: boolean;
  onDeleteBook?: (bookId: string) => Promise<boolean>;
}

export function BookListDeletable({
  books,
  listId,
  canDelete = false,
  onDeleteBook,
}: BookListProps) {
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteBookFromList(listId, bookToDelete.id);
      if (success) {
        toast.success(
          `"${bookToDelete.title}" has been removed from this list`
        );
        router.refresh();
      } else {
        toast.error("Failed to remove book from list");
      }
    } catch (error) {
      console.error("Error removing book:", error);
      toast.error("An error occurred while removing the book");
    } finally {
      setIsDeleting(false);
      setBookToDelete(null);
    }
  };

  if (books.length === 0) {
    return (
      <section>
        <h2 className="flex items-center text-lg font-medium mb-4">
          <span className="mr-2">📚</span> Books in this list
        </h2>
        <div className="h-40 flex gap-2 items-center justify-center text-gray-400">
          There are no books in this list yet.
          <SearchBooksModal
            listId={listId}
            trigger={<p className="underline cursor-pointer">Add some books</p>}
          />
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
              <CardContent className="p-0 h-56 rounded-t-lg overflow-hidden relative">
                <div className="flex flex-col gap-4 items-center justify-center h-full">
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
              <div key={book.id} className="w-full relative group">
                <BookCard book={book} />

                {canDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                    onClick={() => handleDeleteClick(book)}
                    aria-label={`Remove ${book.title} from list`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
        )}
      </div>

      {/* Diálogo de confirmación para eliminar libro */}
      <AlertDialog
        open={!!bookToDelete}
        onOpenChange={(open: boolean) => !open && setBookToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove book from list</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">"{bookToDelete?.title}"</span> from
              this list?
              <br />
              <br />
              This will only remove the book from this list, not from your
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
