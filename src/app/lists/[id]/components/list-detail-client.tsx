"use client";
import { useState } from "react";
import { Book, Comment, List } from "@/db/schema";
import { ListDetailPage } from "./list-detail-page";


interface ListDetailClientProps {
  list: List;
  books: Book[];
  isOwner: boolean;
  isSignedIn: boolean;
  initialComments: Comment[];
  username: string;
}

export function ListDetailClient({ 
  list, 
  books,
  isOwner, 
  isSignedIn, 
  initialComments,
  username
}: ListDetailClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Obtener la URL correcta dependiendo de si la lista es pública o no
    let url = `${window.location.origin}/lists/${list.id}`;
    
    // Si es privada o el dueño está compartiendo, añadimos el parámetro shared
    if (!list.is_public || isOwner) {
      url += `?shared=true`;
    }
    
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <ListDetailPage
      list={list}
      books={books}
      isOwner={isOwner}
      isSignedIn={isSignedIn}
      comments={initialComments}
      copied={copied}
      handleCopy={handleCopy}
      username={username}
    />
  );
}