import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

import { randomBytes } from "crypto";
import 'dotenv/config';

async function main() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const db = drizzle(client);

    // Generador de IDs usando crypto
    const generateId = () => randomBytes(8).toString("hex"); // Genera un ID único de 16 caracteres

    // Insertar usuarios
    const userIds = Array.from({ length: 20 }, () => generateId());
    await Promise.all(
        userIds.map((id, index) =>
            db.insert(schema.Users).values({
                id,
                clerk_user_id: `clerk_${index + 1}`,
                name: `User ${index + 1}`,
                email: `user${index + 1}@example.com`,
                bio: `Bio for user ${index + 1}`,
                avatar_url: `https://example.com/avatar${index + 1}.jpg`,
            }).run()
        )
    );

    // Insertar listas
    const listIds = Array.from({ length: 50 }, () => generateId());
    await Promise.all(
        listIds.map((id, index) =>
            db.insert(schema.Lists).values({
                id,
                user_id: userIds[Math.floor(index / 5)], // Relacionar cada 5 listas con un usuario
                slug: `list-${index + 1}`,
                title: `List ${index + 1}`,
                description: `Description for list ${index + 1}`,
                is_public: index % 2 === 0,
                comments_enabled: true,
            }).run()
        )
    );

    // Insertar libros
    const bookIds = Array.from({ length: 100 }, () => generateId());
    await Promise.all(
        bookIds.map((id, index) =>
            db.insert(schema.Books).values({
                id,
                title: `Book ${index + 1}`,
                author: `Author ${index + 1}`,
                synopsis: `Synopsis for book ${index + 1}`,
                cover_url: `https://example.com/book${index + 1}.jpg`,
            }).run()
        )
    );

    // Insertar relaciones lista-libro
    await Promise.all(
        Array.from({ length: 250 }, (_, index) =>
            db.insert(schema.ListBooks).values({
                id: generateId(),
                list_id: listIds[index % listIds.length], // Relacionar con listas
                book_id: bookIds[index % bookIds.length], // Relacionar con libros
                addedAt: new Date().toISOString(),
            }).run()
        )
    );

    // Insertar comentarios
    await Promise.all(
        Array.from({ length: 150 }, (_, index) =>
            db.insert(schema.Comments).values({
                id: generateId(),
                list_id: listIds[index % listIds.length], // Relacionar con listas
                commenter_name: `Commenter ${index + 1}`,
                text: `Comment text ${index + 1}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).run()
        )
    );

    console.log("Base de datos poblada manualmente.");
}

main();