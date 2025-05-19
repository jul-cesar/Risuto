import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { getAllLists } from "@/actions/lists-actions";
import Link from "next/link";
import { getUserClerk } from "@/actions/clerk-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ListDataItem = NonNullable<Awaited<ReturnType<typeof getAllLists>>["data"]>[0];

interface ListWithBooksAndUser extends ListDataItem {
  user: {
    id: string;
    fullName: string;
    username: string;
    profileImageUrl: string;
  };
}

export default async function ListsPage() {
  const response = await getAllLists();
  const lists = response.data ?? [];
  
  const listsWithUser: ListWithBooksAndUser[] = await Promise.all(
    lists.map(async (list) => {
      const u = await getUserClerk(list.user_id);
      return {
        ...list,
        user: {
          id: u.id,
          fullName: u.fullName ?? u.username ?? "Unknown",
          username: u.username ?? "unknown",
          profileImageUrl: u.imageUrl!,
        },
      };
    })
  ); 

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-2xl">🔥 Last added lists</h1>
        </header>

        {/* Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listsWithUser.map((list) => (
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
                    {list.books.map((book) => (
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

                    {list.books.length < 6 &&
                      Array.from({ length: 6 - list.books.length }).map((_, i) => (
                        <div
                          key={`ph-${i}`}
                          className="aspect-square bg-muted rounded-lg animate-pulse"
                        />
                      ))}
                  </div>

                  {list.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {list.description}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  {/* Avatar del creador */}
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={list.user.profileImageUrl} />
                      <AvatarFallback>
                        {list.user.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{list.user.username}</span>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {new Date(list.updatedAt).toLocaleDateString()}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
