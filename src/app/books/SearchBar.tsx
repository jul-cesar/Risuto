"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  // Función para actualizar la URL con el término de búsqueda
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  // Manejar la búsqueda cuando se envía el formulario
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString("q", searchTerm)}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full sm:w-80 flex-shrink-0"
    >
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="search"
        placeholder="Buscar libros o autores..."
        className="pl-10 pr-4 py-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
}
