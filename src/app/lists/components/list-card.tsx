import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";

export const ListCard = ({ list }: any) => {
  return (
    <Link key={list.id} href={`/lists/${list.slug}`}>
      <Card className="transition hover:scale-[1.02] hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="inline-block w-2 h-2 bg-primary rounded-full" />
            {list.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            {list?.books?.map((book: Book) => (
              <div
                key={book.id}
                className="aspect-square bg-muted rounded-lg overflow-hidden"
              >
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
            ))}

            {list?.books?.length < 6 &&
              Array.from({ length: 6 - list?.books.length }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))}
          </div>

          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {list?.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          {/* Avatar del creador */}
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={list?.user?.profileImageUrl} />
              <AvatarFallback>{list?.user?.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{list?.user?.username}</span>
          </div>

          <span className="text-xs text-muted-foreground">
            {new Date(list?.updatedAt).toLocaleDateString()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};
