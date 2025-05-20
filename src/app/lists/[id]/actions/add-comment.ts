'use server';

import { db } from "@/db";
import { Comments } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addComment(
  text: string,
  commenterName: string,
  listId: string,
  userId: string
) {
  // Validaciones
  if (!text || !text.trim()) {
    throw new Error("El comentario no puede estar vacío");
  }

  if (!commenterName) {
    throw new Error("Se requiere un nombre de usuario");
  }

  if (!listId) {
    throw new Error("Se requiere un ID de lista");
  }

  const now = new Date().toISOString();
  
  try {
    const [newComment] = await db
      .insert(Comments)
      .values({
        text: text.trim(),
        commenter_name: commenterName,
        list_id: listId,
        user_id: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    
    revalidatePath(`/lists/${listId}`);
    
    return newComment;
  } catch (error) {
    console.error("Error al guardar el comentario:", error);
    throw new Error("No se pudo guardar el comentario");
  }
}