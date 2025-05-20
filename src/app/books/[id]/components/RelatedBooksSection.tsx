"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedBooksProps {
  books: {
    book_id: string;
    title: string;
    author: string;
    synopsis: string;
    cover_url: string;
    createdAt: string;
    is_trending: boolean | null;
    publishedAt: string | null;
    pagesInfo: string | null;
    genreCount: unknown;
  }[];
  title?: string;
}

export function RelatedBooks({
  books,
  title = "🤓 Related books",
}: RelatedBooksProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-8">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Desplazar a la izquierda</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Desplazar a la derecha</span>
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          onScroll={checkScrollButtons}
        >
          {books.map((book) => (
            <Link
              key={book.book_id}
              href={`/books/${book.book_id}`}
              className="block min-w-[160px] sm:min-w-[200px] max-w-[200px] transition-transform hover:scale-105"
            >
              <Card className="h-full border overflow-hidden">
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={book.cover_url || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {book.author}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
