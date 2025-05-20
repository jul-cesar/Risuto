"use server";

import { ListWithBooks } from "@/types/models/list-books";
import { clerkClient } from "@clerk/nextjs/server";
import { and, desc, eq, notInArray, or } from "drizzle-orm";
import { db } from "../db";
import { Books, List, ListBooks, Lists, NewList } from "../db/schema";

export interface response<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const getListBySlugOrId = async (
  slugOrId: string
): Promise<response<List>> => {
  try {
    if (!slugOrId) {
      return {
        success: false,
        message: "List ID or slug is required",
      };
    }

    const list = await db
      .select()
      .from(Lists)
      .where(or(eq(Lists.slug, slugOrId), eq(Lists.id, slugOrId)))

      .get();

    if (!list) {
      return {
        success: false,
        message: "List not found",
      };
    }
    return {
      success: true,
      message: "List retrieved successfully",
      data: list,
    };
  } catch (error: unknown) {
    console.error(
      "Error retrieving list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the list",
    };
  }
};

export const createList = async (list: NewList): Promise<response<List>> => {
  // Validación inicial de entrada
  if (!list || Object.keys(list).length === 0) {
    return {
      success: false,
      message: 'List data is required and cannot be empty',
    };
  }
  if(list.slug){ 
const listExist = await db.query.Lists.findFirst({
    where: (Lists, { eq }) => eq(Lists.slug , list.slug ?? ""),
  });
    
  if (listExist) {
    return {
      success: false,
      message: 'List with this slug already exists',
    };
  }
  }
  


  try {
    // 1. Iniciar cliente de Clerk
    const clerk = await clerkClient();

    let newList: List | undefined;

    // 2. Si la lista es privada, crear organización en Clerk
    if (!list.is_public) {
      let organization;

      try {
        // 2.1 Crear organización básica (solo 'name' y 'createdBy')
        organization = await clerk.organizations.createOrganization({
          name: `${list.title}`,
          createdBy: list.user_id,
        });

        // 2.2 Generar un slug seguro (minúsculas y guiones)
        const safeSlug = list.slug
          ? `${list.slug}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
          : undefined;

        // 2.3 Actualizar slug y metadatos
        await clerk.organizations.updateOrganization(
          organization.id,
          {
            slug: safeSlug,
            publicMetadata: {
              isListOrganization: true,
              createdAt: new Date().toISOString(),
            },
          }
        );
      } catch (err: unknown) {
        // Volcar error completo para diagnóstico
        console.error(
          'Raw Clerk error:',
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        );
        // Manejo de error específico de Clerk
        
        return {
          success: false,
          message:
            'There was a problem setting up the organization. Please try again later.',
        };
      }

      // 3. Persistir la lista con el ID de organización
      const listWithOrg = {
        ...list,
        organization_id: organization.id,
      };
      newList = await db.insert(Lists).values(listWithOrg).returning().get();
    } else {
      // 4. Creación de lista pública (sin organización)
      newList = await db.insert(Lists).values(list).returning().get();
    }

    // 5. Validar resultado de inserción
    if (!newList) {
      return {
        success: false,
        message: 'Failed to create list',
      };
    }

    return {
      success: true,
      message: 'List created successfully',
      data: newList,
    };
  } catch (error: unknown) {
    // Errores inesperados
    console.error(
      'Error creating list:',
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: 'An unexpected error occurred while creating the list',
    };
  }
};

export const editList = async (
  listId: string,
  updatedList: Partial<NewList>,
  userId: string
): Promise<response<List>> => {
  try {
    if (!listId || !updatedList || Object.keys(updatedList).length === 0) {
      return {
        success: false,
        message: "List ID and updated data are required",
      };
    }
    const list = await db
      .select()
      .from(Lists)
      .where(eq(Lists.id, listId))
      .get();
      if(!list) {
        return {
          success: false,
          message: "List not found",
        };
      } 
      if(list.user_id !== userId) {
        return {
          success: false,
          message: "You are not authorized to edit this list",
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
    const alreadyInList = await db
      .select()
      .from(ListBooks)
      .where(
        and(
          eq(ListBooks.list_id, listId),
          eq(ListBooks.book_id, bookId)
        )
      )
      .get();
    if (alreadyInList) {
      return {
        success: false,
        message: "Book already in list",
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
export const getUserListsExcludingBook = async (
  userId: string,
  bookId: string
): Promise<response<List[]>> => {
  try {
    if (!userId || !bookId) {
      return {
        success: false,
        message: "User ID and Book ID are required",
      };
    }

    const lists = await db
      .select({
        id: Lists.id,
        user_id: Lists.user_id,
        slug: Lists.slug,
        title: Lists.title,
        description: Lists.description,
        is_public: Lists.is_public,
        comments_enabled: Lists.comments_enabled,
        createdAt: Lists.createdAt,
        updatedAt: Lists.updatedAt,
        organization_id: Lists.organization_id,
      }) // Selecciona solo las columnas de la tabla Lists
      .from(Lists)
      .where(
        and(
          eq(Lists.user_id, userId),
          notInArray(
            Lists.id,
            db
              .select({ list_id: ListBooks.list_id })
              .from(ListBooks)
              .where(eq(ListBooks.book_id, bookId)) // Subconsulta para excluir listas que ya contienen el libro
          )
        )
      )
      .all();

    return {
      success: true,
      message:
        lists.length > 0 ? "Lists retrieved successfully" : "No lists found",
      data: lists,
    };
  } catch (error: unknown) {
    console.error(
      "Error retrieving user lists without the book:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the lists",
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
      message:
        lists.length > 0 ? "Lists retrieved successfully" : "No lists found",
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

export const getListsWithBooks = async (listId: string) => {
  try {
    if (!listId) {
      return {
        success: false,
        message: "List ID is required",
      };
    }

    const rows = await db
      .select({
        list: Lists,
        book: Books,
      })
      .from(Lists)
      .leftJoin(ListBooks, eq(ListBooks.list_id, Lists.id))
      .leftJoin(Books, eq(Books.id, ListBooks.book_id))
      .where(eq(Lists.id, listId));

    if (rows.length === 0) {
      return {
        success: false,
        message: "List not found",
      };
    }

    const list = rows[0].list;

    // Agrupamos todos los libros asociados a esta lista
    const books = rows
      .filter((row) => row.book !== null)
      .map((row) => row.book);

    return {
      success: true,
      message: "List retrieved successfully",
      data: {
        ...list,
        books,
      },
    };
  } catch (error: unknown) {
    console.error(
      "Error retrieving list with books:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message:
        "An unexpected error occurred while retrieving the list with books",
    };
  }
};

export const deleteBookFromList = async (
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

    const deleted = await db
      .delete(ListBooks)
      .where(
        and(
          eq(ListBooks.list_id, listId),
          eq(ListBooks.book_id, bookId)
        )
      )
      .returning()
      .get();

    if (!deleted) {
      return {
        success: false,
        message: "Failed to delete book from list",
      };
    }
    return {
      success: true,
      message: "Book deleted from list successfully",
    };
  } catch (error: unknown) {
    console.error(
      "Error deleting book from list:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      message:
        "An unexpected error occurred while deleting the book from the list",
    };
  }
}

export const getAllLists = async (): Promise<response<ListWithBooks[]>> => {
  try {
    // 1) traemos todas las listas públicas
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
      .where(eq(Lists.is_public, true))
      .orderBy(desc(Lists.createdAt))
      .all();

    if (lists.length === 0) {
      return {
        success: true,
        message: "No lists found",
        data: [],
      };
    }

    // 2) recuperamos todos los últimos 5 libros de una vez
    const listIds = lists.map((l) => l.id);
    const rawBooks = await Promise.all(
      listIds.map(async (listId) => {
        const recents = await db
          .select({
            id:   Books.id,
            title: Books.title,
            author: Books.author,
            cover_url: Books.cover_url,
            addedAt: ListBooks.addedAt,
          })
          .from(ListBooks)
          .leftJoin(Books, eq(Books.id, ListBooks.book_id))
          .where(eq(ListBooks.list_id, listId))
          .orderBy(desc(ListBooks.addedAt))
          .limit(6)
          .all();

        return { listId, books: recents };
      })
    );

    // 3) montamos el array final
    const data: ListWithBooks[] = lists.map((list) => {
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
      message: "Lists retrieved successfully",
      data,
    };
  } catch (error: unknown) {
    console.error("Error retrieving all lists:", error);
    return {
      success: false,
      message: "An unexpected error occurred while retrieving the lists",
    };
  }
};

    