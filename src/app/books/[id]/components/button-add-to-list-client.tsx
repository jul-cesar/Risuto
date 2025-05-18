"use client";

import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { addBookToList } from "@/actions/lists-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface List {
  id: string;
  title: string;
}
interface Props {
  bookId: string;
  userLists: List[];
}

export default function AddToListButtonClient({ bookId, userLists }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAdd = (listId: string) => {
    startTransition(async () => {
      try {
        await addBookToList(listId, bookId);
        router.refresh();
        toast.success("✅ Libro agregado", {
          action: {
            label: "Ver mi lista",
            onClick: () => router.push(`/lists/${listId}`),
          },
        });
      } catch (err) {
        toast.error("❌ No se pudo agregar. Intenta de nuevo.");
        console.error(err);
      }
    });
  };

  if (userLists.length === 0) {
    return (
      <Button variant="outline" disabled>
        No hay listas
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isPending}
          className="bg-primary text-primary-foreground font-mono font-bold px-6 py-2 rounded-md hover:bg-gray-200 transition"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isPending ? "Añadiendo..." : "Add to list"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userLists.map((list) => (
          <DropdownMenuItem
            key={list.id}
            asChild
            onSelect={() => handleAdd(list.id)}
          >
            <button className="w-full text-left">{list.title}</button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
