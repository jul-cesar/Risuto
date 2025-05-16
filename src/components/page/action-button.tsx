import Link from "next/link";
import { Button } from "@/components/ui/button"; // Asumiendo que usas shadcn/ui u otra librería similar
import { ReactNode } from "react";

interface ActionButtonProps {
  href: string;
  children: ReactNode;
}

export function ActionButton({ href, children }: ActionButtonProps) {
  return (
    <Link href={href}>
      <Button className="bg-primary text-primary-foreground font-mono font-bold px-6 py-2 rounded-md mb-4 hover:bg-primary/90 transition">
        {children}
      </Button>
    </Link>
  );
}