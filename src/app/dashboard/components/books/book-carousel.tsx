"use client";

import { Button } from "@/components/ui/button";
import type { Book } from "@/db/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { BookCard } from "./book-card";

export function BooksCarousel({ books }: { books: Book[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.1;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.1;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        className="flex space-x-6 p-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="secondary"
        size="lg"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-md z-10"
        onClick={scrollLeft}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-md z-10"
        onClick={scrollRight}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
