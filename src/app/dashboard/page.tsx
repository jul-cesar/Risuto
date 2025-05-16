"use client"; // quitar con los fetch

import { getTrendingBooks } from "@/actions/book-actions";
import { getCurrentUserLists } from "@/actions/lists-actions";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { TrendingBooks } from "./components/books/trending-books";
import { CreateListDialog } from "./components/my-lists/dialog-new-list/create-list-dialog";
import { MyLists } from "./components/my-lists/my-lists";

export default function DashboardPage() {
  const { data: books = [], isLoading: isLoadingTrendings } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await getTrendingBooks();
      return res;
    },
  });
  const { user } = useUser();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["MyLists"],
    queryFn: async () => {
      if (!user?.id) return []; // Retorna un array vacío si no hay usuario
      const res = await getCurrentUserLists(user.id);
      if (!res) return []; // Retorna un array vacío si no hay listas
      return res.data;
    },
    enabled: !!user?.id, // Habilita la consulta solo si user.id está definido
  });

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      {/* contenedor centrado y con padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-2xl">Welcome {user?.username}...</h1>
        </header>

        {/* Trending books */}
        <TrendingBooks books={books} isLoading={isLoadingTrendings} />

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
