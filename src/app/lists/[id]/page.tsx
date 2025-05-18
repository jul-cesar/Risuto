import { getBooksFromList } from "@/actions/book-actions";
import { getListBySlugOrId } from "@/actions/lists-actions";
import { db } from "@/db";
import { Comments } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { ListDetailClient } from "./components/list-detail-client";

export const getComments = async (listId: string) => {
  return await db
    .select()
    .from(Comments)
    .where(eq(Comments.list_id, listId))
    .orderBy(desc(Comments.createdAt));
};

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
  const { shared } = searchParams ? await searchParams : { shared: undefined };

  // Fetch de datos
  const list = (await getListBySlugOrId(slugOrId)).data;
  const books = list ? (await getBooksFromList(list.id)).data : [];
  const commentsList = list ? await getComments(list.id) : [];

  const user = await currentUser();

  // Lógica de permisos
  const isOwner = !!(user?.id && list?.user_id === user.id);
  const isShared = !!shared;

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
      books={books ?? []}
      isOwner={isOwner}
      isSignedIn={!!user?.id}
      initialComments={commentsList}
      username={user?.username || "Anónimo"}
    />
  );
}
