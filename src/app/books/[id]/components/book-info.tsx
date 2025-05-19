import { getBookGenres } from "@/actions/book-actions";
import { Separator } from "@/components/ui/separator";
import { Book } from "@/db/schema";

interface BookInfoProps {
  book: Book;
}

export async function BookInfo({ book }: BookInfoProps) {
  const genres = await getBookGenres(book.id);
  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <p className="text-sm text-gray-400">by {book.author}</p>
      <div className="flex  justify-between gap-1">
        <p className="text-xs text-gray-500">
          Published for the first time:{" "}
          {new Date(book.publishedAt || "").toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500">{book.pagesInfo}</p>
      </div>

      <p className="">
        Genres: {genres.data?.map((genre) => genre.genre).join(", ")}
      </p>
      <Separator className="border-white/20" />
      <div className="text-md leading-relaxed font-sans ">{book.synopsis}</div>
    </div>
  );
}
