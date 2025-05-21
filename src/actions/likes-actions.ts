 "use server";

import { db } from "@/db";
import { Books, Likes, ListBooks, Lists, Reactions } from "@/db/schema";
import { ListWithBooks } from "@/types/models/list-books";
import { LikeWithClerkUser } from "@/types/models/list-likes";
import { and, desc, eq, inArray, sql } from "drizzle-orm"; // tu tabla intermedia de likes
import { getUserClerk } from "./clerk-actions";
import { response } from "./lists-actions";

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
          username: u.username ?? "Unknown",
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

/*
 * Obtiene todas las listas a las que el usuario le dio like,
 * junto con la reacción y la info del creador de cada lista.
 */
export const getListsLikedByUser = async (
  userId: string
): Promise<response<ListWithBooks[]>> => {
  try {
    // 1) Traemos todas las listas que el usuario ha dado like, con fechas para ordenar
    const likedListsInfo = await db
      .select({
        list_id: Likes.list_id,
        likedAt: Likes.createdAt,
      })
      .from(Likes)
      .where(eq(Likes.user_id, userId))
      .orderBy(desc(Likes.createdAt))  
      .all();

    if (likedListsInfo.length === 0) {
      return {
        success: true,
        message: "No liked lists found",
        data: [],
      };
    }

    const listIds = likedListsInfo.map((like) => like.list_id);

    // 2) Traemos los detalles completos de esas listas
    const lists = await db
      .select({
        id: Lists.id,
        user_id: Lists.user_id,
        slug: Lists.slug,
        title: Lists.title,
        description: Lists.description,
        is_public: Lists.is_public,
        comments_enabled: Lists.comments_enabled,
        organization_id: Lists.organization_id,
        createdAt: Lists.createdAt,
        updatedAt: Lists.updatedAt,
      })
      .from(Lists)
      .where(inArray(Lists.id, listIds))
      .all();
      
    const orderedLists = listIds.map(id => 
      lists.find(list => list.id === id)
    ).filter(Boolean) as typeof lists;

    // 3) Recuperamos los últimos 6 libros para cada lista
    const rawBooks = await Promise.all(
      orderedLists.map(async (list) => {
        const recents = await db
          .select({
            id: Books.id,
            title: Books.title,
            author: Books.author,
            cover_url: Books.cover_url,
            addedAt: ListBooks.addedAt,
          })
          .from(ListBooks)
          .leftJoin(Books, eq(Books.id, ListBooks.book_id))
          .where(eq(ListBooks.list_id, list.id))
          .orderBy(desc(ListBooks.addedAt))
          .limit(6)
          .all();
        return { listId: list.id, books: recents };
      })
    );

    // 4) Montamos el array final con la misma estructura que getAllLists
    const data: ListWithBooks[] = orderedLists.map((list) => {
      const match = rawBooks.find((rb) => rb.listId === list.id);
      const books = (match?.books ?? [])
        .filter(
          (b) =>
            b.id !== null &&
            b.title !== null &&
            b.author !== null &&
            b.cover_url !== null
        )
        .map((b) => ({
          id: b.id as string,
          title: b.title as string,
          author: b.author as string,
          cover_url: b.cover_url as string,
          addedAt: b.addedAt,
        }));
      return {
        ...list,
        books,
      };
    });

    return {
      success: true,
      message: "Liked lists retrieved successfully",
      data,
    };
  } catch (error: unknown) {
    console.error("Error retrieving liked lists:", error);
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the liked lists",
    };
  }
};

