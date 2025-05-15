"use client"; // quitar con los fetch

import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {  Plus } from "lucide-react"
import { Book, List } from "@/db/schema";
import { useState } from "react";
import Link from "next/link";



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
    <main className="flex-1 bg-gradient-to-b from-zinc-900 to-black text-white font-mono">
      {/* contenedor centrado y con padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-2xl">Welcome Laaguna...</h1>
        </header>

        {/* Trending books */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm space-x-1">
              <span>🔥 Trending books</span>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No hay libros
            </div>
          ) : (
            <ScrollArea className="w-full pb-4">
              <div className="flex space-x-6">
                {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex-shrink-0"
                >
                  <Card className="w-40 transition-transform transform hover:scale-105 cursor-pointer">
                    <CardContent className="p-0 h-56 bg-zinc-800 overflow-hidden">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </CardContent>
                    <CardFooter className="px-2 py-1">
                      <p className="text-xs line-clamp-1">{book.title}</p>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </section>

        <Separator className="border-white/20 mb-12" />

        {/* My lists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm space-x-1">
              
              <span>📚 My lists</span>
            </div>
            
            {/* Trigger del modal */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center text-sm hover:underline space-x-1">
                <Plus className="w-5 h-5" />
                <span>New list</span>
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-md bg-zinc-800 rounded-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-center font-mono text-lg">
                  Create new list
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My reading list"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="A list of my favorite science fiction books..."
                  />
                </div>

                <div>
                  <Label className="mb-1">Visibility</Label>
                  <RadioGroup
                    value={visibility}
                    onValueChange={(val) =>
                      setVisibility(val as "public" | "private")
                    }
                    className="flex space-x-4"
                  >
                    <Label htmlFor="vis-public" className="flex items-center space-x-1">
                      <RadioGroupItem id="vis-public" value="public" />
                      <span>Public</span>
                    </Label>
                    <Label htmlFor="vis-private" className="flex items-center space-x-1">
                      <RadioGroupItem id="vis-private" value="private" />
                      <span>Private</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="comments-enabled"
                    checked={commentsEnabled}
                    onCheckedChange={(chk) => setCommentsEnabled(!!chk)}
                  />
                  <Label htmlFor="comments-enabled">Turn on comments</Label>
                </div>

                <div>
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-reading-list"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6 flex justify-center">
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

          {lists.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              No hay listas
            </div>
          ) : (
            <ScrollArea className="w-full pb-4">
              <div className="flex space-x-6">
                {lists.map((lst) => (
                  <Link
                  key={lst.id}
                  href={`/lists/${lst.id}`}
                  className="flex-shrink-0"
                  >
                  <Card key={lst.id} className="w-40 flex-shrink-0 transition-transform transform hover:scale-105">
                    <CardContent className="h-32 flex items-center justify-center text-center">
                      <p className="text-xs line-clamp-2">{lst.title}</p>
                    </CardContent>
                  </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </section>
      </div>
    </main>
  );
}
