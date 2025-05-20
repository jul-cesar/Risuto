"use client";
import {
  getBooksByGenreName,
  getGenres,
  getRelatedBooks,
  getTrendingBooks,
} from "@/actions/book-actions";
import { getUserSharedOrganizations } from "@/actions/clerk-actions";
import { getCurrentUserLists } from "@/actions/lists-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingBooks } from "./components/books/trending-books";
import { GenresBooks } from "./components/GenresBooks";
import { CreateListDialog } from "./components/my-lists/dialog-new-list/create-list-dialog";
import { MyLists } from "./components/my-lists/my-lists";
import { SharedLists } from "./components/shared-lists/shared-lists";

export default function DashboardPage() {
  const { user } = useUser();

  // Obtener los géneros y luego los libros correspondientes
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardData"],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    queryFn: async () => {
      // Primero obtenemos todos los géneros disponibles
      const genresResponse = await getGenres();

      // Verificamos si la respuesta es exitosa y contiene géneros
      const allGenres =
        genresResponse.success && genresResponse.data
          ? genresResponse.data
          : [];

      // Seleccionamos 3 géneros aleatorios si hay suficientes
      const selectedGenres = selectRandomGenres(allGenres, 3);

      // Obtenemos los datos básicos
      const [books, listsResponse, userOrganizations] = await Promise.all([
        getTrendingBooks(),
        user?.id ? getCurrentUserLists(user.id) : [],
        user?.id ? getUserSharedOrganizations(user.id) : [],
      ]);

      // Obtenemos los libros para los géneros seleccionados
      const genreBooks = await Promise.all(
        selectedGenres.map((genre) => getBooksByGenreName(genre.name))
      );

      const lists = Array.isArray(listsResponse)
        ? []
        : listsResponse?.data || [];
      const trendings = Array.isArray(books) ? [] : books?.data || [];
      const userOrgs = Array.isArray(userOrganizations)
        ? userOrganizations
        : [];

      // Procesamos los resultados de los libros por género
      const genreBooksData = genreBooks.map((response, index) => {
        const genre = selectedGenres[index];
        console.log(`Mapping genre - name: ${genre.name}, id: ${genre.id}`); // Log para depuración
        
        return {
          genreName: genre.name,
          books: Array.isArray(response) ? [] : response?.data || [],
          genreId: genre.id, // Asegurarnos de que el ID se pasa correctamente
        };
      });

      return {
        trendings,
        lists,
        userOrgs,
        genreBooksData,
        selectedGenres,
      };
    },
    enabled: !!user,
  });

  const books = data?.trendings || [];
  const lists = data?.lists || [];
  const userOrgs = data?.userOrgs || [];
  const genreBooksData = data?.genreBooksData || [];

  const { data: res } = useQuery({
    queryKey: ["recommended"],
    queryFn: async () => {
      // Verificar si tenemos un libro para obtener recomendaciones
      if (!books.length || !books[7]?.id) {
        return []; // Devolver array vacío si no hay libros disponibles
      }

      const r = await getRelatedBooks(books[7]?.id);
      // Siempre devolver un array (vacío si no hay datos exitosos)
      return r.success ? r.data : [];
    },
    // Solo habilitar la consulta si hay libros disponibles
    enabled: !!books.length,
  });

  const personalizedRecommendation = res?.slice(0, 3) ?? [];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      {/* Sidebar */}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
            {/* Welcome Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-background to-background  p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Welcome back, {user?.username || "Reader"}!
                  </h1>
                  <p className="text-white/80 max-w-md">
                    Continue your reading journey with personalized
                    recommendations and track your progress.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="bg-white/10">
                      Discover New Books
                    </Button>
                  </div>
                </div>

                {personalizedRecommendation && (
                  <div className="flex gap-4">
                    {personalizedRecommendation.map((book) => (
                      <Card
                        onClick={() => {
                          window.open(`/books/${book.book_id}`, "_blank"); // Abre en una nueva
                        }}
                        key={book.book_id}
                        className="w-48 } bg-black/40 backdrop-blur-lg border-white/10"
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm">
                            Recommended for you
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="mb-3">
                            <div className="aspect-[2/3] rounded-md bg-black/20 mb-2 overflow-hidden">
                              {book.cover_url && (
                                <img
                                  src={book.cover_url || "/placeholder.svg"}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <p className="text-xs font-medium truncate">
                              {book.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {book.author}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex mb-6">
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="my-lists">My Lists</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
                <TabsTrigger value="explore">Explore</TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-6 mt-2">
                <TrendingBooks books={books} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="my-lists" className="space-y-6 mt-2">
                <MyLists
                  lists={lists}
                  dialogTrigger={<CreateListDialog />}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="shared" className="space-y-6 mt-2">
                <SharedLists organizations={userOrgs} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="explore" className="space-y-8 mt-2">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="inline-block w-1 h-6 bg-purple-500 rounded-full"></span>
                    Explore by Genre
                  </h2>

                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    genreBooksData.map((genreData, index) => {
                      console.log(`Rendering genre ${index} - ${genreData.genreName}, id: ${genreData.genreId}`); // Log para depuración
                      return (
                        <GenresBooks
                          key={genreData.genreId || index}
                          genreId={genreData.genreId}
                          books={genreData.books}
                          genreName={genreData.genreName}
                          isLoading={isLoading}
                        />
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
// Función para seleccionar géneros aleatorios de una lista
function selectRandomGenres(
  genres: { id: string; name: string }[],
  count: number
) {
  const shuffled = [...genres].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
