// src/app/books/[id]/page.tsx
import { Button } from "@/components/ui/button"
import { use } from "react";
import { BookCover } from "./components/book-cover";
import { BookInfo } from "./components/book-info";
import { ActionBar } from "./components/action-bar";


const getBookById = (id: string) => ({
  id,
  title: "El código Da Vinci",
  author: "Dan Brown",
  synopsis:
    "Un thriller que mezcla historia, arte y religión: Robert Langdon debe descifrar un misterio oculto en pinturas renacentistas.",
  cover_url: "https://i.imgur.com/PIo43KF.jpeg",
  createdAt: "2023-05-10T14:23:00Z",
})


export default function BookDetail({params}: {params: Promise<{ id: string }>}) {
  const { id } = use(params)
  const book = getBookById(id)

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
  )
}
