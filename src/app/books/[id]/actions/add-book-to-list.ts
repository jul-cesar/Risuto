import { db } from "@/db";
import { ListBooks } from "@/db/schema";

export const addBookToList = async (listId: string, bookId: string) => {
  return await db.insert(ListBooks).values({
    list_id: listId,
    book_id: bookId,
    });
};