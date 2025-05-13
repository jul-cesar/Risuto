# BookList - Plataforma para Gestionar Listas de Libros

BookList es una plataforma donde los usuarios pueden crear, organizar y compartir listas de libros. Puedes agregar libros a tus listas, dejarlas públicas o privadas, y permitir o deshabilitar comentarios en tus listas. 

Este proyecto está diseñado para quienes aman los libros y desean organizarlos de manera sencilla, además de compartir sus lecturas con otros usuarios.


    cd booklist
    `
3. Configura ``

2. Instala las dependencias:

    ```bash
    npm install
    ```
la base de datos. Asegúrate de tener PostgreSQL en funcionamiento y crea una base de datos:

    ```bash
    psql -U postgres
    CREATE DATABASE booklist;
    ```

4. Configura las variables de entorno en un archivo `.env`:

    ```bash
    DATABASE_URL=postgres://usuario:contraseña@localhost:5432/booklist
    PORT=3000
    ```

5. Ejecuta las migraciones para crear las tablas en la base de datos:

    ```bash
    npm run migrate
    ```

6. Inicia el servidor:

    ```bash
