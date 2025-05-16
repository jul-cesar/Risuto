import { List } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function ListCard({ list } : { list : List }) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="flex-shrink-0"
    >
      <Card className="w-40 flex-shrink-0 transition-transform transform hover:scale-105">
        <CardContent className="h-32 flex items-center justify-center text-center">
          <p className="text-xs line-clamp-2">{list.title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}