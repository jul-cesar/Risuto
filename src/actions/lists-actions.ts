"use server";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { List, ListBooks, Lists, NewList } from "../db/schema";

interface response<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const createList = async (list: NewList): Promise<response<List>> => {
  try {
    if (!list || Object.keys(list).length === 0) {
      return {
        success: false,
        message: "List data is required and cannot be empty",
      };
    }

    const newList = await db.insert(Lists).values(list).returning().get();
    if (!newList) {
      return {
        success: false,
        message: "Failed to create list",
      };
    }
    return {
      success: true,
      message: "List created successfully",
      data: newList,
    };
  } catch (error: unknown) {
    console.error(
      "Error creating list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while creating the list",
    };
  }
};

export const editList = async (
  listId: string,
  updatedList: Partial<NewList>
): Promise<response<List>> => {
  try {
    if (!listId || !updatedList || Object.keys(updatedList).length === 0) {
      return {
        success: false,
        message: "List ID and updated data are required",
      };
    }

    const updated = await db
      .update(Lists)
      .set(updatedList)
      .where(eq(Lists.id, listId))
      .returning()
      .get();

    if (!updated) {
      return {
        success: false,
        message: "Failed to update list",
      };
    }
    return {
      success: true,
      message: "List updated successfully",
      data: updated,
    };
  } catch (error: unknown) {
    console.error(
      "Error updating list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while updating the list",
    };
  }
};

export const deleteList = async (listId: string): Promise<response<void>> => {
  try {
    if (!listId) {
      return {
        success: false,
        message: "List ID is required",
      };
    }

    const deleted = await db
      .delete(Lists)
      .where(eq(Lists.id, listId))
      .returning()
      .get();

    if (!deleted) {
      return {
        success: false,
        message: "Failed to delete list",
      };
    }
    return {
      success: true,
      message: "List deleted successfully",
    };
  } catch (error: unknown) {
    console.error(
      "Error deleting list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while deleting the list",
    };
  }
};

export const addBookToList = async (
  listId: string,
  bookId: string
): Promise<response<void>> => {
  try {
    if (!listId || !bookId) {
      return {
        success: false,
        message: "List ID and Book ID are required",
      };
    }

    const result = await db
      .insert(ListBooks)
      .values({ book_id: bookId, list_id: listId })
      .returning()
      .get();

    if (!result) {
      return {
        success: false,
        message: "Failed to add book to list",
      };
    }
    return {
      success: true,
      message: "Book added to list successfully",
    };
  } catch (error: unknown) {
    console.error(
      "Error adding book to list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while adding the book to the list",
    };
  }
};

export const getCurrentUserLists = async (
  userId: string
): Promise<response<List[]>> => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    const lists = await db
      .select()
      .from(Lists)
      .where(eq(Lists.user_id, userId))
      .all();

    return {
      success: true,
      message: lists.length > 0 ? "Lists retrieved successfully" : "No lists found",
      data: lists,
    };
  } catch (error: unknown) {
    console.error(
      "Error retrieving user lists:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the lists",
    };
  }
};
