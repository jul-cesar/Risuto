"use client";

import { getTrendingBooks } from "@/actions/book-actions";
import { getCurrentUserLists } from "@/actions/lists-actions";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { TrendingBooks } from "./components/books/trending-books";
import { CreateListDialog } from "./components/my-lists/dialog-new-list/create-list-dialog";
import { MyLists } from "./components/my-lists/my-lists";

export default function DashboardPage() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const [books, listsResponse] = await Promise.all([
        getTrendingBooks(),
        user?.id ? getCurrentUserLists(user.id) : [],
      ]);

      const lists = Array.isArray(listsResponse)
        ? []
        : listsResponse?.data || [];

      const trendings = Array.isArray(books) ? [] : books?.data || [];

      return {
        trendings,
        lists,
      };
    },
    enabled: !!user, // Solo ejecuta la consulta si el usuario está definido // Solo ejecuta la consulta si el usuario está definido
  });

  const books = data?.trendings || [];
  const lists = data?.lists || [];

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

        {/* My lists */}
        <MyLists
          lists={lists}
          dialogTrigger={<CreateListDialog />}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
