// src/app/books/[id]/page.tsx
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"


const getBookById = (id: string) => ({
  id,
  title: "El código Da Vinci",
  author: "Dan Brown",
  synopsis:
    "Un thriller que mezcla historia, arte y religión: Robert Langdon debe descifrar un misterio oculto en pinturas renacentistas.",
  cover_url: "/covers/da-vinci.jpg",
  createdAt: "2023-05-10T14:23:00Z",
})

type Props = { params: { id: string } }

export default function BookDetail({ params }: Props) {
  const book = getBookById(params.id)

  return (
    <main className="flex-1 bg-gradient-to-b from-zinc-900 to-black text-white font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Imagen y datos principales */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full md:w-1/3 h-auto object-cover rounded-md border border-white/20"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-sm text-gray-400">by {book.author}</p>
            <p className="text-xs text-gray-500">
              Published: {new Date(book.createdAt).toLocaleDateString()}
            </p>
            <Separator className="border-white/20" />
            <div className="text-base leading-relaxed">{book.synopsis}</div>
          </div>
        </div>

        {/* Acción: agregar a lista */}
        <div className="pt-4 border-t border-white/20 flex justify-end">
          <Button className="bg-white text-black font-mono font-bold px-6 py-2 rounded-md hover:bg-gray-200 transition">
            Add to list
          </Button>
        </div>
      </div>
    </main>
  )
}
