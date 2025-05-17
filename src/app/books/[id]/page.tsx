// src/app/books/[id]/page.tsx
import { BookCover } from "./components/book-cover";
import { BookInfo } from "./components/book-info";
import { ActionBar } from "./components/action-bar";
import { db } from "@/db";
import { Books } from "@/db/schema";
import { eq } from 'drizzle-orm'
import AddToListButton from "./components/button-add-to-list";

const getBookById = async (id: string) => {
  return await db
    .select()
    .from(Books)
    .where(eq(Books.id, id))
    .limit(1)
    .then(results => results[0] || null);
};

export const dynamic = "force-dynamic"; 

export default async function BookDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Imagen y datos principales */}
        <div className="flex flex-col md:flex-row gap-6">
          <BookCover src={book.cover_url} alt={book.title} />
          <BookInfo book={book} />
        </div>
        {/* Acción: agregar a lista */}
        <ActionBar>
          <AddToListButton bookId={book.id} />
        </ActionBar>
      </div>
    </main>
  );
}

