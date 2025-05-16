"use server"

import { db } from "@/db";

export const getTrendingBooks = async () => {
  const books = await db.query.Books.findMany({
    where: (Books, { eq }) => eq(Books.is_trending, true),
  });
  return books;
};
