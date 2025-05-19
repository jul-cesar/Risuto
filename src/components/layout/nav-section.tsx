import Link from "next/link";
import { SignedIn } from "@clerk/nextjs";
import { ReactNode } from "react";

export function NavSection() {
  return (
    <div className="flex items-center gap-6">
      <Logo />
      <AuthNavLinks />
    </div>
  );
}


export function Logo() {
  return (
    <Link href="/dashboard">
      <span className="text-lg font-bold text-foreground hover:text-muted-foreground transition-colors duration-200 cursor-pointer">
        Risuto
      </span>
    </Link>
  );
}


function AuthNavLinks() {
  return (
    <SignedIn>
      <nav className="flex items-center gap-4 text-foreground">
        <NavLink>Books</NavLink>
        <Link 
          href={"/lists"}

        >Lists</Link>
      </nav>
    </SignedIn>
  );
}

interface NavLinkProps {
  children: ReactNode;
  href?: string;
}

function NavLink({ children, href = "#" }: NavLinkProps) {
  return (
    <Link href={href}>
      <span className="hover:text-muted-foreground transition-colors duration-200 cursor-pointer">
        {children}
      </span>
    </Link>
  );
}