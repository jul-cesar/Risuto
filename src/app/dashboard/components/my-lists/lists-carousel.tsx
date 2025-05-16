import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { List } from "@/db/schema";
import { ListCard } from "./list-card";

export function ListsCarousel({ lists }: { lists: List[] }) {
  return (
    <ScrollArea className="w-full pb-6 overflow-visible">
      <div className="flex space-x-6 p-2">
        {lists.map((list : List) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}