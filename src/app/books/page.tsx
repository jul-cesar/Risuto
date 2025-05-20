import { getBooksPaginated, getGenres } from "@/actions/book-actions";
import { Suspense } from "react";
import { BookGrid } from "./BookGrid";

interface PageProps {
  searchParams: {
    q?: string;
    genre?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { q: searchTerm, genre: genreId } = searchParams;

  // Obtener géneros para el filtro
  const genres = await getGenres();

  // Obtener la primera página de libros
  const { data: books, hasMore } = await getBooksPaginated(1, 10, searchTerm);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8 text-3xl font-bold">Biblioteca de Libros</h1>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* <SearchBar /> */}
        {/* <GenreFilter genres={genres.data ?? []} /> */}
      </div>

      <Suspense fallback={<div>Cargando libros...</div>}>
        <BookGrid
          initialBooks={books}
          initialHasMore={hasMore ?? false}
          searchTerm={searchTerm}
        />
      </Suspense>
    </main>
  );
}
