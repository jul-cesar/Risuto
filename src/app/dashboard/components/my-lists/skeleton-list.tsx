"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ListCardSkeleton } from "./list-skeleton";

export function SkeletonList() {
  const skeletonItems = Array.from({ length: 5 }, (_, i) => i);

  return (
    <ScrollArea className="w-full pb-6 overflow-visible">
      <div className="flex space-x-6 p-2">
        {skeletonItems.map((item) => (
          <ListCardSkeleton key={item} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
