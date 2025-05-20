 "use server";

import { and, eq, sql } from "drizzle-orm"; // tu tabla intermedia de likes
import { Likes, Reactions } from "@/db/schema";
import { db } from "@/db";
import { getUserClerk } from "./clerk-actions";
import { LikeWithClerkUser } from "@/types/models/list-likes";

/*
 * Agrega un "like" de userId a listId.
 * Si ya existe, actualiza la reacción.
 * Si la reacción es la misma, no hace nada.
 */
export const likeList = async (
  listId: string,
  userId: string,
  reactionId: string
) => {
  const existingLike = await db
    .select({
      id: Likes.id,
      reaction_id: Likes.reaction_id,
    })
    .from(Likes)
    .where(and(eq(Likes.list_id, listId), eq(Likes.user_id, userId)))
    .get();

  if (existingLike) {
    if (existingLike.reaction_id === reactionId) {
      return {
        success: false,
        message: "Like already exists with the same reaction",
      };
    }

    await db
      .update(Likes)
      .set({ reaction_id: reactionId })
      .where(eq(Likes.id, existingLike.id));

    return {
      success: true,
      message: "Like reaction updated successfully",
    };
  }

  await db.insert(Likes).values({
    list_id: listId,
    user_id: userId,
    reaction_id: reactionId,
  });

  return {
    success: true,
    message: "Like added successfully",
  };
};

/*
 * Elimina un "like" existente de userId a listId.
 * Si no existe, no arroja error.
 */
export const unlikeList = async (listId: string, userId: string) => {
  const existingLike = await db
    .select({ id: Likes.id })
    .from(Likes)
    .where(
      and(eq(Likes.list_id, listId), eq(Likes.user_id, userId))
    )
    .get();

  if (!existingLike) {
    return {
      success: false,
      message: "Like does not exist",
    };
  }

  await db
    .delete(Likes)
    .where(eq(Likes.id, existingLike.id));

  return {
    success: true,
    message: "Like removed successfully",
  };
};


/*
* Verifica si un usuario ya le dio like a una lista.
*/
export const hasUserLikedList = async (
  listId: string,
  userId: string
): Promise<boolean> => {
  const like = await db
    .select({ id: Likes.id })
    .from(Likes)
    .where(and(eq(Likes.list_id, listId), eq(Likes.user_id, userId)))
    .get();

  return !!like;
};

/*
 * Recupera los likes de una lista y enriquece cada like
 * con la info de usuario que viene de Clerk.
 */
export const getLikesWithClerk = async (
  listId: string
): Promise<LikeWithClerkUser[]> => {
  const likes = await db
    .select({
      id: Likes.id,
      list_id: Likes.list_id,
      user_id: Likes.user_id,
      reaction_id: Likes.reaction_id,
      createdAt: Likes.createdAt,
      reaction: {
        id: Reactions.id,
        code: Reactions.code,
        label: Reactions.label,
        icon: Reactions.icon,
      },
    })
    .from(Likes)
    .innerJoin(Reactions, eq(Likes.reaction_id, Reactions.id))
    .where(eq(Likes.list_id, listId))
    .all();

  const likesWithUser = await Promise.all(
    likes.map(async (like) => {
      const u = await getUserClerk(like.user_id);
      return {
        id: like.id,
        list_id: like.list_id,
        user_id: like.user_id,
        createdAt: like.createdAt,
        reaction: like.reaction,
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

/*
 * Recupera un like específico de un usuario para una lista.
 */
export const getUserLikeForList = async (
  listId: string,
  userId: string
): Promise<LikeWithClerkUser | null> => {
  const like = await db
    .select({
      id: Likes.id,
      list_id: Likes.list_id,
      user_id: Likes.user_id,
      createdAt: Likes.createdAt,
      reaction: {
        id: Reactions.id,
        code: Reactions.code,
        label: Reactions.label,
        icon: Reactions.icon,
      },
    })
    .from(Likes)
    .innerJoin(Reactions, eq(Likes.reaction_id, Reactions.id))
    .where(and(eq(Likes.list_id, listId), eq(Likes.user_id, userId)))
    .get();

  if (!like) return null;

  const u = await getUserClerk(like.user_id);

  return {
    id: like.id,
    list_id: like.list_id,
    user_id: like.user_id,
    createdAt: like.createdAt,
    reaction: like.reaction,
    user: {
      id: u.id,
      fullName: u.fullName ?? u.username ?? "Unknown",
      username: u.username ?? "unknown",
      profileImageUrl: u.imageUrl ?? "", 
    },
  };
};

/*
 * Recupera la cantidad de likes en una lista
 */
export const countLikesForList = async (listId: string): Promise<number> => {
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(Likes)
    .where(eq(Likes.list_id, listId))
    .all();

  return typeof count === "string" ? parseInt(count, 10) : count;
};

