"use client";

import { getBooksByGenreName, getTrendingBooks } from "@/actions/book-actions";
import { getUserSharedOrganizations } from "@/actions/clerk-actions";
import { getCurrentUserLists } from "@/actions/lists-actions";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { TrendingBooks } from "./components/books/trending-books";
import { GenresBooks } from "./components/GenresBooks";
import { CreateListDialog } from "./components/my-lists/dialog-new-list/create-list-dialog";
import { MyLists } from "./components/my-lists/my-lists";
import { SharedLists } from "./components/shared-lists/shared-lists";

export default function DashboardPage() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const [
        books,
        listsResponse,
        userOrganizations,
        mangaBooks,
        romanceBooks,
        dramaBooks,
      ] = await Promise.all([
        getTrendingBooks(),
        user?.id ? getCurrentUserLists(user.id) : [],
        user?.id ? getUserSharedOrganizations(user.id) : [],
        getBooksByGenreName("manga"),
        getBooksByGenreName("romance"),
        getBooksByGenreName("drama"),
      ]);

      const lists = Array.isArray(listsResponse)
        ? []
        : listsResponse?.data || [];

      const trendings = Array.isArray(books) ? [] : books?.data || [];

      const userOrgs = Array.isArray(userOrganizations)
        ? userOrganizations
        : [];
      const manga = Array.isArray(mangaBooks) ? [] : mangaBooks?.data || [];
      const romance = Array.isArray(romanceBooks)
        ? []
        : romanceBooks?.data || [];

      const drama = Array.isArray(dramaBooks) ? [] : dramaBooks?.data || [];

      return {
        trendings,
        lists,
        userOrgs,
        manga,
        romance,
        drama,
      };
    },
    enabled: !!user, // Solo ejecuta la consulta si el usuario está definido // Solo ejecuta la consulta si el usuario está definido
  });

  const books = data?.trendings || [];
  const lists = data?.lists || [];
  const userOrgs = data?.userOrgs || [];
  const mangabo = data?.manga || [];
  const romance = data?.romance || [];

  const drama = data?.drama || [];

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      {/* contenedor centrado y con padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-2xl">Welcome {user?.username}...</h1>
        </header>

        {/* Trending books */}
        <TrendingBooks books={books} isLoading={isLoading} />

        <Separator className="border-white/20 mb-12" />

        <GenresBooks books={mangabo} genreName="Manga" isLoading={isLoading} />
        <GenresBooks
          books={romance}
          genreName="Romance"
          isLoading={isLoading}
        />
        <Separator className="border-white/20 mb-12" />

        <GenresBooks books={drama} genreName="Drama" isLoading={isLoading} />
        <Separator className="border-white/20 mb-12" />

        {/* My lists */}
        <MyLists
          lists={lists}
          dialogTrigger={<CreateListDialog />}
          isLoading={isLoading}
        />

        <Separator className="border-white/20 mb-12" />

        {/* Shared lists */}
        <SharedLists organizations={userOrgs} isLoading={isLoading} />
      </div>
    </main>
  );
}
