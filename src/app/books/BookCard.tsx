import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Book } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  book: Omit<Book, "createdAt" | "publishedAt"> | undefined;
  genres?: {
    id: string;
    name: string;
  }[];
}

export function BookCard({ book, genres }: BookCardProps) {
  if (!book) {
    return null;
  }
  return (
    <Link href={`/books/${book.id}`} className="flex-shrink-0 w-48">
      <Card className="md:p-2  h-full flex flex-col transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer">
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
        <CardFooter>
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-800 dark:text-zinc-200"
                >
                  {genre.name}
                </span>
              ))}
              {genres.length > 3 && (
                <span className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-800 dark:text-zinc-200">
                  +{genres.length - 3}
                </span>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
