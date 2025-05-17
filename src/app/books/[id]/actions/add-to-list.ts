"use server";

import { revalidatePath } from "next/cache";
import { addBookToList } from "./add-book-to-list";

export interface AddToListParams {
  listId: string
  bookId: string
}

/**
 * Server Action para agregar un libro a una lista.
 * Se invoca directamente desde el cliente con un objeto { listId, bookId }.
 */
export async function addToListAction({
  listId,
  bookId,
}: AddToListParams): Promise<void> {
  // Validación básica
  if (!listId || !bookId) {
    console.error("addToListAction: faltan listId o bookId")
    return
  }

  try {
    // La función que inserta en tu BD
    await addBookToList(listId, bookId)

    // Revalida la página de detalles del libro para que Next.js refresque el cache
    revalidatePath(`/books/${bookId}`)
  } catch (error) {
    console.error("addToListAction: error al agregar libro a la lista:", error)
  }
}
