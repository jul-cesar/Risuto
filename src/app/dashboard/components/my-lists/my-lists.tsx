import { List } from "@/db/schema";
import { EmptyState } from "../empty-state";
import { ListsCarousel } from "./lists-carousel";

interface MyListsProps {
  lists: List[];
  dialogTrigger: React.ReactNode;
}

export function MyLists({ lists, dialogTrigger } : MyListsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm space-x-1">
          <span>📚 My lists</span>
        </div>
        
        {/* Trigger del modal */}
        {dialogTrigger}
      </div>

      {lists.length === 0 ? (
        <EmptyState message="No hay listas" />
      ) : (
        <ListsCarousel lists={lists} />
      )}
    </section>
  );
}