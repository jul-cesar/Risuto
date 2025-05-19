import { EmptyState } from "../empty-state";
import { SkeletonList } from "../my-lists/skeleton-list";
import { SharedListsCarousel } from "./shared-lists-carousel";

interface SharedListsProps {
  organizations: any[];
  isLoading: boolean;
}

export function SharedLists({ organizations, isLoading }: SharedListsProps) {
  return (
    <section className="mb-12">
          <div className="flex items-center justify-start mb-4">
            <div className="flex items-center text-sm space-x-1">
              <span>😎 Shared with me</span>
            </div>
    
          </div>
    
          {isLoading ? (
            <SkeletonList />
          ) : organizations.length === 0 ? (
            <EmptyState message="Lists shared with you will appear here." />
          ) : (
            <SharedListsCarousel organizations={organizations} />
          )}
        </section>
  );
}