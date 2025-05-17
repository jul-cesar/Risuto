// src/app/lists/[id]/page.tsx
"use client";

import { getListsWithBooks } from "@/actions/lists-actions";
import { Comment } from "@/db/schema";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { use, useState } from "react";
import { ListDetailPage } from "./components/list-detail-page";

export default function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugOrId } = use(params);

  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const isShared =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("shared");
  const [copied, setCopied] = useState(false);

  const { data: list, isLoading } = useQuery({
    queryKey: ["list"],
    queryFn: async () => {
      const res = await getListsWithBooks(slugOrId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
  });

  const isOwner: boolean = !!(isSignedIn && userId === list?.user_id);

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
  ]);

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
  };

  const handleCopy = async () => {
    const url = `${window.location.origin}/lists/${list?.id}?shared=true`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }

  if (!list) {
    return <div className="p-8">Lista no encontrada</div>;
  }

  if (!list.is_public && !isOwner && !isShared) {
    return <div className="p-8">No autorizado</div>;
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
