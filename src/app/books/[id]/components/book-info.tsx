import { Separator } from "@/components/ui/separator"; 
import { Book } from "@/db/schema";

interface BookInfoProps {
  book: Book;
}

export function BookInfo({ book }: BookInfoProps) {
  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <p className="text-sm text-gray-400">by {book.author}</p>
      <p className="text-xs text-gray-500">
        Published: {new Date(book.createdAt).toLocaleDateString()}
      </p>
      <Separator className="border-white/20" />
      <div className="text-base leading-relaxed">{book.synopsis}</div>
    </div>
  );
}