interface BookCoverProps {
  src: string;
  alt: string;
}

export function BookCover({ src, alt }: BookCoverProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full md:w-1/3 h-auto object-cover rounded-md border border-white/20"
    />
  );
}