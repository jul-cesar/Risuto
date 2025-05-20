"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface GenreFilterProps {
  genres: {
    id: string;
    name: string;
  }[];
}

export function GenreFilter({ genres }: GenreFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGenreId = searchParams.get("genre");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get the selected genre
  const selectedGenre = currentGenreId
    ? genres.find((g) => g.id.toString() === currentGenreId)
    : null;

  // Get popular genres (first 10)
  const popularGenres = genres.slice(0, 10);

  // Filter genres based on search query
  const filteredGenres = searchQuery
    ? genres.filter((genre) =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Limit the number of filtered genres to prevent lag
  const limitedFilteredGenres = filteredGenres.slice(0, 50);

  const handleSelectGenre = (genreId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (genreId !== null) {
      params.set("genre", genreId.toString());
    } else {
      params.delete("genre");
    }

    router.push(`/books?${params.toString()}`);
    setIsOpen(false);
  };

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedGenre ? selectedGenre.name : "Todos los géneros"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Search input */}
        <div className="p-2 sticky top-0 bg-popover z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar género..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[300px]">
          {/* "All genres" option */}
          <DropdownMenuItem
            className="flex items-center justify-between"
            onClick={() => handleSelectGenre(null)}
          >
            <span>Todos los géneros</span>
            {!selectedGenre && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Show search results if there's a query */}
          {searchQuery && (
            <>
              {limitedFilteredGenres.length > 0 ? (
                limitedFilteredGenres.map((genre) => (
                  <DropdownMenuItem
                    key={genre.id}
                    className="flex items-center justify-between"
                    onClick={() => handleSelectGenre(genre.id)}
                  >
                    <span>{genre.name}</span>
                    {selectedGenre?.id === genre.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No se encontraron géneros
                </div>
              )}

              {filteredGenres.length > 50 && (
                <div className="px-2 py-2 text-center text-xs text-muted-foreground">
                  Mostrando 50 de {filteredGenres.length} resultados. Refina tu
                  búsqueda para ver más.
                </div>
              )}
            </>
          )}

          {/* Show popular genres if no search query */}
          {!searchQuery && (
            <>
              <div className="px-2 py-1.5 text-sm font-medium">
                Géneros populares
              </div>
              {popularGenres.map((genre) => (
                <DropdownMenuItem
                  key={genre.id}
                  className="flex items-center justify-between"
                  onClick={() => handleSelectGenre(genre.id)}
                >
                  <span>{genre.name}</span>
                  {selectedGenre?.id === genre.id && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}

              {selectedGenre &&
                !popularGenres.some((g) => g.id === selectedGenre.id) && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-sm font-medium">
                      Selección actual
                    </div>
                    <DropdownMenuItem
                      className="flex items-center justify-between"
                      onClick={() => handleSelectGenre(selectedGenre.id)}
                    >
                      <span>{selectedGenre.name}</span>
                      <Check className="h-4 w-4" />
                    </DropdownMenuItem>
                  </>
                )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
