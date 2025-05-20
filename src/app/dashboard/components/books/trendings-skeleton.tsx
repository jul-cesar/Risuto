import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function BookCardSkeleton() {
  return (
    <div className="w-[180px] shrink-0 space-y-3">
      {/* Book cover skeleton */}
      <Skeleton className="w-full aspect-[3/4] rounded-md" />

      {/* Book title skeleton */}
      <Skeleton className="h-4 w-4/5" />

      {/* Author name skeleton */}
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function BooksCarouselSkeleton() {
  // Create an array of 6 items to represent loading books
  const skeletonItems = Array.from({ length: 20 }, (_, i) => i);

  return (
    <ScrollArea className="w-full pb-6">
      <div className="flex space-x-4">
        {skeletonItems.map((item) => (
          <BookCardSkeleton key={item} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
