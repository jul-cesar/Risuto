// No pongas "use client"
import { ReactNode } from "react";

interface ActionBarProps {
  children: ReactNode;
}

export function ActionBar({ children }: ActionBarProps) {
  return (
    <div className="pt-4 border-t border-white/20 flex justify-end">
      {children}
    </div>
  );
}
