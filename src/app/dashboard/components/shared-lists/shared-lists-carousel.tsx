import { ScrollBar } from "@/components/ui/scroll-area";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { SharedCard } from "./shared-card";

export function SharedListsCarousel({ organizations }: { organizations: any[] }) {
  return (
    <ScrollArea className="w-full pb-6 overflow-visible">
      <div className="flex space-x-6 p-2">
        {organizations.map((org) => (
          <SharedCard key={org.id} organization={org} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}