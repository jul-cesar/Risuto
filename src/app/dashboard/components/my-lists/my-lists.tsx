import type { List } from "@/db/schema";
import type React from "react";
import { EmptyState } from "../empty-state";
import { ListsCarousel } from "./lists-carousel";
import { SkeletonList } from "./skeleton-list";


interface MyListsProps {
  lists: List[];
  dialogTrigger: React.ReactNode;
  isLoading?: boolean;
}

export function MyLists({
  lists,
  dialogTrigger,
  isLoading = false,
}: MyListsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm space-x-1">
          <span>📚 My lists</span>
        </div>

        {/* Trigger del modal */}
        {dialogTrigger}
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : lists.length === 0 ? (
        <EmptyState message="No hay listas" />
      ) : (
        <ListsCarousel lists={lists} />
      )}
    </section>
  );
}
