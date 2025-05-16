import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Book } from "@/db/schema";
import Link from "next/link";
import Image from "next/image";

export function BookCard({ book } : { book : Book}) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="flex-shrink-0 w-48"
    >
      <Card className="p-2 h-full flex flex-col transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer">
        <CardContent className="p-0 h-56 bg-zinc-800 rounded-t-lg overflow-hidden relative">
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, 12rem"
            className="object-cover"
            priority
          />
        </CardContent>

        <CardHeader className="px-3 space-y-1">
          <h3 className="text-sm font-semibold line-clamp-2">{book.title}</h3>
          <p className="text-xs text-gray-400">by {book.author}</p>
        </CardHeader>
      </Card>
    </Link>
  );
}