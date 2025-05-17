import { db } from "@/db";
import { Lists } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getOwnLists = async (userId: string) => {
  return await db
    .select()
    .from(Lists)
    .where(eq(Lists.user_id, userId));
};