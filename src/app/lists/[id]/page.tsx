import { Books, Comments, ListBooks, Lists } from "@/db/schema";
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
    .innerJoin(Books, eq(ListBooks.book_id, Books.id))
    .where(eq(ListBooks.list_id, listId))
    .orderBy(desc(Books.createdAt));

  return books;
};

export const getComments = async (listId: string) => {
  return await db
    .select()
    .from(Comments)
    .where(eq(Comments.list_id, listId))
    .orderBy(desc(Comments.createdAt))
}

export const dynamic = "force-dynamic"; 

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ shared?: string }>;
}) {
  // Resolvemos las promesas
  const { id: slugOrId } = await params;              
  const { shared } = searchParams                     
    ? await searchParams
    : { shared: undefined };

  // Fetch de datos
  const list = await getListByIdOrslug(slugOrId);
  const books = list ? await getBooksFromList(list.id) : [];
  const commentsList = list ? await getComments(list.id) : [];
  const user = await currentUser();

  // Lógica de permisos
  const isOwner = !!(user?.id && list?.user_id === user.id);
  const isShared = !!shared;

  if (!list) {
    return <div className="p-8">Lista no encontrada</div>;
  }

  if (!list.is_public && !isOwner && !isShared) {
    return <div className="p-8">No autorizado</div>;
  }

  return (
    <ListDetailClient
      list={list}
      books={books}
      isOwner={isOwner}
      isSignedIn={!!user?.id}
      initialComments={commentsList}
      username={user?.username || "Anónimo"}
    />
  );
}