"use server";

import { revalidatePath } from "next/cache";
import { addBookToList } from "./add-book-to-list";

export async function addToListAction(formData: FormData): Promise<void> {
  const listId = formData.get("listId") as string;
  const bookId = formData.get("bookId") as string;

  if (!listId || !bookId) {
    console.error("Missing required data");
    return;
  }

  try {
    await addBookToList(listId, bookId);
    revalidatePath(`/books/${bookId}`);
  } catch (error) {
    console.error("Failed to add book to list:", error);
    return;
  }
}
