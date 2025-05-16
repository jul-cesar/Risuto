"use client"; // quitar con los fetch

import { getTrendingBooks } from "@/actions/book-actions";
import { Separator } from "@/components/ui/separator";
import { List } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingBooks } from "./components/books/trending-books";
import { CreateListDialog } from "./components/my-lists/dialog-new-list/create-list-dialog";
import { MyLists } from "./components/my-lists/my-lists";

export default function DashboardPage() {
  const [lists, setLists] = useState<List[]>([
    {
      id: "a",
      title: "Mis lecturas favoritas",
      description: "Todo lo que me encantó",
      user_id: "user_123",
      slug: "favoritas",
      is_public: true,
      comments_enabled: false,
      createdAt: "2023-04-20",
      updatedAt: "2023-04-22",
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [slug, setSlug] = useState("");

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const res = getTrendingBooks();
      return res;
    },
  });

  const { user } = useUser();

  const handleCreate = () => {
    const newList: List = {
      id: Date.now().toString(),
      title,
      description,
      user_id: "me",
      slug: slug || null,
      is_public: visibility === "public",
      comments_enabled: commentsEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLists((prev) => [newList, ...prev]);
    // reset
    setTitle("");
    setDescription("");
    setVisibility("public");
    setCommentsEnabled(false);
    setSlug("");
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      {/* contenedor centrado y con padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-2xl">Welcome {user?.username}...</h1>
        </header>

        {/* Trending books */}
        <TrendingBooks books={books} />

        <Separator className="border-white/20 mb-12" />

        {/* My lists */}
        <MyLists
          lists={lists}
          dialogTrigger={
            <CreateListDialog
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              visibility={visibility}
              setVisibility={setVisibility}
              commentsEnabled={commentsEnabled}
              setCommentsEnabled={setCommentsEnabled}
              slug={slug}
              setSlug={setSlug}
              handleCreate={handleCreate}
            />
          }
        />
      </div>
    </main>
  );
}
