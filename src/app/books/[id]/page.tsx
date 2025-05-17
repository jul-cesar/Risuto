// src/app/books/[id]/page.tsx
import { Button } from "@/components/ui/button"
import { use } from "react";
import { BookCover } from "./components/book-cover";
import { BookInfo } from "./components/book-info";
import { ActionBar } from "./components/action-bar";
import { db } from "@/db";
import { Books } from "@/db/schema";
import { eq } from 'drizzle-orm'



const getBookById = async (id: string) => {

  const book = await db
    .select()
    .from(Books)
    .where(eq(Books.id, id))
    .limit(1)
    .then(results => results[0] || null);
  
  return book;
};


export default async function BookDetail({ params }: { params: { id: string } }) {
  const book = await getBookById(params.id);

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
          <Button className="bg-primary text-primary-foreground font-mono font-bold px-6 py-2 rounded-md hover:bg-gray-200 transition">
            Add to list
          </Button>
        </ActionBar>
      </div>
    </main>
  );
}

