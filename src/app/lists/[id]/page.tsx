// src/app/lists/[id]/page.tsx
"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

type Book = {
  id: string;
  title: string;
  cover_url: string;
};

type Comment = {
  id: string;
  user: string;
  content: string;
  createdAt: string;
};

type ListDetail = {
  id: string;
  title: string;
  description: string;
  books: Book[];
  createdAt: string;
};

const getListById = (id: string): ListDetail => ({
  id,
  title: "Mis lecturas de verano",
  description: "Una lista con los libros que quiero leer estas vacaciones.",
  createdAt: "2023-07-01",
  books: [
    {
      id: "1",
      title: "El juego de Ender",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
    },
    {
      id: "2",
      title: "Dune",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
    },
    {
      id: "3",
      title: "Foundation",
      cover_url: "https://i.imgur.com/PIo43KF.jpeg",
    },
  ],
});

const getComments = (): Comment[] => [
  {
    id: "c1",
    user: "Alice",
    content: "¡Me encantó Dune!",
    createdAt: "2023-07-15T10:20:00Z",
  },
  {
    id: "c2",
    user: "Bob",
    content: "Ender es un clásico de la ciencia ficción.",
    createdAt: "2023-07-16T14:45:00Z",
  },
];

export default function ListPage({ params }: { params: { id: string } }) {
  const list = getListById(params.id);
  const comments = getComments();

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera de la lista */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{list.title}</h1>
          <p className="text-sm text-gray-400">{list.description}</p>
          <p className="text-xs text-gray-500">
            Created: {new Date(list.createdAt).toLocaleDateString()}
          </p>
        </header>

        <Separator className="border-white/20" />

        {/* Libros de la lista */}
        <section>
          <h2 className="flex items-center text-lg mb-4">
            <span className="mr-2">📚</span> Books in this list
          </h2>

          {list.books.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              No hay libros en esta lista
            </div>
          ) : (
            <ScrollArea className="w-full pb-4 overflow-visible">
              <div className="flex space-x-6 p-4">
                {list.books.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex-shrink-0 w-40 transition-transform transform hover:scale-105 cursor-pointer"
                  >
                    <Card>
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
            </ScrollArea>
          )}
        </section>

        <Separator className="border-white/20" />

        {/* Sección de comentarios */}
        <section>
          <h2 className="flex items-center text-lg mb-4 text-foreground">
            <MessageSquare className="w-5 h-5 mr-2" />
            Comments
          </h2>

          {comments.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No hay comentarios
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-card rounded-md p-4 space-y-1 text-card-foreground"
                >
                  <p className="text-xs text-muted-foreground">
                    {c.user} &bull;{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
