"use client";
import { useState } from "react";
import { Book, Comment, Like, List } from "@/db/schema";
import { ListDetailPage } from "./list-detail-page";
import { LikeWithClerkUser } from "@/types/models/list-likes";
import { useAuth } from "@clerk/nextjs";
import { likeList, unlikeList } from "@/actions/likes-actions";


interface ListDetailClientProps {
  list: List;
  books: Book[];
  isOwner: boolean;
  isSignedIn: boolean;
  initialComments: Comment[];
  likes: LikeWithClerkUser[];
  username: string;
}

export function ListDetailClient({ 
  list, 
  books,
  likes,
  isOwner, 
  isSignedIn, 
  initialComments,
  username,
}: ListDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const { userId } = useAuth()

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
      likes={likes}
      isOwner={isOwner}
      isSignedIn={isSignedIn}
      comments={initialComments}
      copied={copied}
      handleCopy={handleCopy}
      username={username}
    />
  );
}