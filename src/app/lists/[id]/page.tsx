// src/app/lists/[id]/page.tsx
"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MessageSquare, LinkIcon } from "lucide-react";
import { use, useState } from "react";
import { List } from "@/db/schema";
import { SignInButton, useAuth } from "@clerk/nextjs";

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

interface ListDetail extends List {
  books: Book[];
}

const lists: ListDetail[] = [
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
    ],
  },
  {
    id: "b",
    title: "Lecturas secretas",
    description: "Solo para mis ojos",
    user_id: "user_2x42yS6hicQbB26KZMk45fmBxjB",
    slug: "secretas",
    is_public: false,
    comments_enabled: true,
    createdAt: "2023-05-10",
    updatedAt: "2023-05-11",
    books: [],
  },
];

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

function getListBySlugOrId(slugOrId: string): ListDetail | undefined {
  return lists.find(
    (list) => list.id === slugOrId || list.slug === slugOrId
  );
}


export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = use(params);
  const list = getListBySlugOrId(slugOrId);
  const { isSignedIn, userId } = useAuth();
  const comments = getComments();
  const isOwner = isSignedIn && userId === list?.user_id;
  const isShared = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("shared");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/lists/${list?.id}?shared=true`;
    await navigator.clipboard.writeText(url);
    setCopied(true)
    setTimeout(() => setCopied(false), 2000);
  };

  if (!list) {
    return <div className="p-8">Lista no encontrada</div>;
  }

  // Bloquear acceso si privada y ni dueño ni tiene ?shared
  if (!list.is_public && !isOwner && !isShared) {
    return <div className="p-8">No autorizado</div>;
  }


  if (!list) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Lista no encontrada</h1>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera de la lista */}
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{list.title}</h1>
              {list.is_public ? (
                isOwner ? (
                  // Si es pública **y** el owner la ve, generamos link CON shared
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" /> 
                    {copied ? "Enlace copiado!" : "Compartir con link privado"}
                  </button>
                ) : (
                  // Si es pública y NO es el owner, generamos link SIN shared
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/lists/${list.slug}`;
                      await navigator.clipboard.writeText(url);
                    }}
                    className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" /> Compartir
                  </button>
                )
              ) : isOwner ? (
                // Si NO es pública y es el owner, generamos link CON shared
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" /> 
                  {copied ? "Enlace copiado!" : "Generar enlace privado"}
                </button>
              ) : null}
          </div>
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
        {list.comments_enabled && (
          <section>
            <h2 className="flex items-center text-lg mb-4">
              <MessageSquare className="w-5 h-5 mr-2" /> Comments
            </h2>

            {!list.is_public && !isSignedIn ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <SignInButton mode="modal">
                  <button className="text-sm underline">Inicia sesión para comentar</button>
                </SignInButton>
              </div>
            ) : comments.length === 0 ? (
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
        )}
      </div>
    </main>
  );
}
