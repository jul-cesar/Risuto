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
  const [comments, setComments] = useState<Comment[]>(initialComments);

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

  const handleAddComment = async (text: string): Promise<void> => {
    const newComment = {
      id: Date.now().toString(),
      text,
      commenter_name: username,
      list_id: list.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Aquí podrías hacer una llamada a tu API para guardar el comentario
    // Por ejemplo:
    // await fetch('/api/comments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newComment)
    // });
    
    // Por ahora simulamos una operación asíncrona
    return new Promise((resolve) => {
      setTimeout(() => {
        setComments((prev) => [...prev, newComment]);
        resolve();
      }, 300); // Simulamos un pequeño delay para hacer más realista la operación
    });
  };

  return (
    <ListDetailPage
      list={list}
      books={books}
      isOwner={isOwner}
      isSignedIn={isSignedIn}
      comments={comments}
      copied={copied}
      handleCopy={handleCopy}
      onAddComment={handleAddComment}
    />
  );
}