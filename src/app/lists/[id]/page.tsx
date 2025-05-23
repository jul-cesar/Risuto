import { getBooksFromList } from "@/actions/book-actions";
import { getLikesWithClerk } from "@/actions/likes-actions";
import { getListBySlugOrId } from "@/actions/lists-actions";
import { getUser } from "@/actions/user-actions";
import { db } from "@/db";
import { Comments } from "@/db/schema";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { ListDetailClient } from "./components/list-detail-client";
import { getUserClerk, getUserInvitations } from "@/actions/clerk-actions";

export const getComments = async (listId: string) => {
  return await db
    .select()
    .from(Comments)
    .where(eq(Comments.list_id, listId))
    .orderBy(desc(Comments.createdAt));
};

async function isUserActiveMember(
  organizationId: string,
  userId: string
): Promise<boolean> {
  // Obtenemos el listado de membership de Clerk
  const clerk = await clerkClient();
  const { data: membershipData } =
    await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    });

  // membershipData es un array de objetos con info de cada miembro
  // por ejemplo: { id, role, publicUserData: { id, identifier, ... }, ... }
  return membershipData.some((m) => {
    // m.publicUserData.id es el id de Clerk del usuario
    return m.publicUserData?.userId === userId;
  });
}

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { shared?: string; __clerk_ticket?: string };
}) {
  const { id: slugOrId } = await params;

  // 1. Await explícito de searchParams
  const sp = searchParams ? await Promise.resolve(searchParams) : {};
  const { __clerk_ticket } = sp;

  // 2) Fetch de lista y datos relacionados
  const listRes = await getListBySlugOrId(slugOrId);
  const list = listRes.data;
  if (!list) {
    return <div className="p-8">Lista no encontrada</div>;
  }

  const user = await currentUser();
  const userId = user?.id;

  // 3) Permisos
  const isOwner = userId === list.user_id;
  const isMember =
    typeof userId === "string" && typeof list.organization_id === "string"
      ? await isUserActiveMember(list.organization_id, userId)
      : false;
  const isPendingInvite = Boolean(__clerk_ticket) && !isMember && !isOwner;

  if (!list.is_public && !isOwner && !isMember && !isPendingInvite) {
    return <div className="p-8">No autorizado</div>;
  }

  // 4) Fetch de books y comments
  const books = (await getBooksFromList(list.id)).data ?? [];
  const commentsList = await getComments(list.id);
  const likes = await getLikesWithClerk(list.id);
  const listOwner = (await getUserClerk(list.user_id));

  return (
    <>
      <ListDetailClient
        listOwner={listOwner}
        list={list}
        books={books}
        likes={likes}
        isOwner={isOwner}
        isSignedIn={!!userId}
        initialComments={commentsList}
        username={user?.username || "Anónimo"}
      />
    </>
  );
}
