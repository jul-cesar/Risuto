"use client"; // quitar con los fetch

import { Separator } from "@/components/ui/separator"
import { Book, List } from "@/db/schema";
import { useState } from "react";
import { TrendingBooks } from "./components/books/trending-books";
import { MyLists } from "./components/my-lists/my-lists";
import { CreateListDialog } from "./components/my-lists/dialog-new-list/create-list-dialog";
import { useUser } from "@clerk/nextjs";


export const dynamic = "force-dynamic" 
export default function DashboardPage() {

  const [books] = useState<Book[]>([
    {
      id: "1",
      title: "El código Da Vinci",
      author: "Dan Brown",
      synopsis: "Misterio en el Louvre...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-05-10",
    },
    {
      id: "2",
      title: "1984",
      author: "George Orwell",
      synopsis: "Distopía totalitaria...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-06-01",
    },
    {
      id: "3",
      title: "1984",
      author: "George Orwell",
      synopsis: "Distopía totalitaria...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-06-01",
    },
    {
      id: "4",
      title: "1984",
      author: "George Orwell",
      synopsis: "Distopía totalitaria...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-06-01",
    },
    {
      id: "5",
      title: "1984",
      author: "George Orwell",
      synopsis: "Distopía totalitaria...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-06-01",
    },
    {
      id: "6",
      title: "1984",
      author: "George Orwell",
      synopsis: "Distopía totalitaria...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-06-01",
    },
    {
      id: "7",
      title: "1984",
      author: "George Orwell",
      synopsis: "Distopía totalitaria...",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
      createdAt: "2023-06-01",
    },
  ])

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
  ])

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [slug, setSlug] = useState("");

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
