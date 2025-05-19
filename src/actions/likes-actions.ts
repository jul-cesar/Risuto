 "use server";

import { and, eq } from "drizzle-orm"; // tu tabla intermedia de likes
import { createId } from "@paralleldrive/cuid2";
import { Likes } from "@/db/schema";
import { db } from "@/db";
import { getUserClerk } from "./clerk-actions";
import { LikeWithClerkUser } from "@/types/models/list-likes";

/**
 * Agrega un "like" de userId a listId.
 * Si ya existe, no hace nada.
 */
export const likeList = async (listId: string, userId: string) => {
  await db
    .insert(Likes)
    .values({
      id: createId(),
      list_id: listId,
      user_id: userId,
    })
    .onConflictDoNothing({
      target: [Likes.user_id, Likes.list_id],
    });
};

/**
 * Elimina un "like" existente de userId a listId.
 * Si no existe, no arroja error.
 */
export const unlikeList = async (listId: string, userId: string) => {
  await db
    .delete(Likes)
    .where(
      and(
        eq(Likes.list_id, listId),
        eq(Likes.user_id, userId)
      )
    );
};

/**
 * Recupera los likes de una lista y enriquece cada like
 * con la info de usuario que viene de Clerk.
 */
export const getLikesWithClerk = async (
  listId: string
): Promise<LikeWithClerkUser[]> => {
  // 1) Traemos solo los likes puros de la tabla
  const likes = await db
    .select({
      id: Likes.id,
      list_id: Likes.list_id,
      user_id: Likes.user_id,
      createdAt: Likes.createdAt,
    })
    .from(Likes)
    .where(eq(Likes.list_id, listId))
    .all();

  // 2) Para cada like, traemos la info del user desde Clerk
  const likesWithUser = await Promise.all(
    likes.map(async (like) => {
      const u = await getUserClerk(like.user_id);
      return {
        ...like,
        user: {
          id: u.id,
          fullName: u.fullName ?? u.username ?? "Unknown",
          username: u.username ?? "unknown",
          profileImageUrl: u.imageUrl ?? "", 
        },
      };
    })
  );

  return likesWithUser;
};