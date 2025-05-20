"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

  const selectedGenre = currentGenreId
    ? genres.find((g) => g.id.toString() === currentGenreId)
    : null;

  const handleSelectGenre = (genreId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (genreId !== null) {
      params.set("genre", genreId.toString());
    } else {
      params.delete("genre");
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedGenre ? selectedGenre.name : "Todos los géneros"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => handleSelectGenre(null)}
        >
          <span>Todos los géneros</span>
          {!selectedGenre && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        {genres.map((genre) => (
          <DropdownMenuItem
            key={genre.id}
            className="flex items-center justify-between"
            onClick={() => handleSelectGenre(genre.id)}
          >
            <span>{genre.name}</span>
            {selectedGenre?.id === genre.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
