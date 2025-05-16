// src/app/lists/[id]/page.tsx
"use client";

import { use, useState } from "react";
import { Book, Comment, List } from "@/db/schema";
import { ListDetailPage } from "./components/list-detail-page";
import { useAuth, useUser } from "@clerk/nextjs";


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
        title: "El juego de Dune",
        author: "Frank Herbert",
        synopsis: "El juego de Dune es una novela de ficción escrita por el británico Frank Herbert en 1965. La historia sigue a un joven llamado Paul Atreides, quien viaja por el universo Dune, buscando una batalla con un enemigo más poderoso que el Imperio de los Imperios.",
        cover_url: "https://i.imgur.com/PIo43KF.jpeg",
        createdAt: "2023-05-10T14:23:00Z",
      },
      {
        id: "3",
        title: "Dune",
        author: "Frank Herbert",
        synopsis: "El juego de Dune es una novela de ficción escrita por el británico Frank Herbert en 1965. La historia sigue a un joven llamado Paul Atreides, quien viaja por el universo Dune, buscando una batalla con un enemigo más poderoso que el Imperio de los Imperios.",
        cover_url: "https://i.imgur.com/PIo43KF.jpeg",
        createdAt: "2023-05-10T14:23:00Z",
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


function getListBySlugOrId(slugOrId: string): ListDetail | undefined {
  return lists.find(
    (list) => list.id === slugOrId || list.slug === slugOrId
  );
}


export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = use(params);
  const list = getListBySlugOrId(slugOrId);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser()
  const isOwner: boolean = !!(isSignedIn && userId === list?.user_id);
  const isShared = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("shared");
  const [copied, setCopied] = useState(false);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      text: "¡Me encantó Dune!",
      createdAt: "2023-07-15T10:20:00Z",
      updatedAt: "2023-07-15T10:20:00Z",
      list_id: "a",
      commenter_name: "Alice",
    },
    {
      id: "c2",
      text: "Ender es un clásico de la ciencia ficción.", 
      createdAt: "2023-07-16T14:45:00Z", 
      updatedAt: "2023-07-16T14:45:00Z", 
      list_id: "a", 
      commenter_name: "Bob",
    },
  ])

  const handleAddComment = async (text: string) => {
    const newComment = {
      id: Date.now().toString(),
      text,
      commenter_name: user?.username ?? "Anónimo",
      list_id: list?.id ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
  }

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
    <ListDetailPage
      list={list}
      isOwner={isOwner}
      isSignedIn={!!isSignedIn}
      comments={comments}
      copied={copied}
      handleCopy={handleCopy} 
      onAddComment={handleAddComment}    
      />
  );
}
