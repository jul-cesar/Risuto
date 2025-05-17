import { Books, Comment, ListBooks, Lists } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { ListDetailClient } from "./components/list-detail-client";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";

const getListByIdOrslug = async (slugOrId : string ) => {
  return await db
  .select()
  .from(Lists)
  .where(eq(Lists.id, slugOrId) || eq(Lists.slug, slugOrId))
  .limit(1)
  .then(results => results[0] || null);
}

export const getBooksFromList = async (listId: string) => {
  // Consulta utilizando join para obtener los libros asociados a una lista
  const books = await db
    .select({
      id: Books.id,
      title: Books.title,
      author: Books.author,
      synopsis: Books.synopsis,
      cover_url: Books.cover_url,
      createdAt: Books.createdAt,
      is_trending: Books.is_trending,
    })
    .from(ListBooks)
    // Hacemos un join con la tabla Books para obtener la información completa de cada libro
    .innerJoin(Books, eq(ListBooks.book_id, Books.id))
    // Filtramos para obtener solo los libros de la lista específica
    .where(eq(ListBooks.list_id, listId))
    // Ordenamos por fecha de creación, más recientes primero
    .orderBy(desc(Books.createdAt));

  return books;
};


function getCommentsByListId(listId: string): Comment[] {
  return [
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
  ].filter(comment => comment.list_id === listId);
}

export default async function ListPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { shared?: string };
}) {
  // Esto ahora funciona como un Server Component
  const { id: slugOrId } = params;
  const list = await getListByIdOrslug(slugOrId);
  const books = await getBooksFromList(list.id)
  const comments = list ? getCommentsByListId(list.id) : [];
  
  const user = await currentUser();
  
  // Verificamos si el usuario es propietario de la lista
  const isOwner = !!(user && user.id && list?.user_id === user.id);
  
  // Verificar si se compartió a través de la URL
  const isShared = !!searchParams?.shared;
  
  if (!list) {
    return <div className="p-8">Lista no encontrada</div>;
  }
  
  // Bloquear acceso si privada y ni dueño ni tiene ?shared
  if (!list.is_public && !isOwner && !isShared) {
    return <div className="p-8">No autorizado</div>;
  }

  return (
    <ListDetailClient
      list={list}
      books={books}
      isOwner={isOwner}
      isSignedIn={!!user && !!user.id}
      initialComments={comments}
      username={user?.username || "Anónimo"}
    />
  );
}