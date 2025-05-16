import { NavSection } from "./nav-section";
import { AuthSection } from "./auth-section";

export function Header() {
  return (
    <header className="flex justify-around items-center px-6 py-4 h-16 border-b border-border bg-background-secondary">
      <NavSection />
      <AuthSection />
    </header>
  );
}