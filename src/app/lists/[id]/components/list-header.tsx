"use client";
import { List } from "@/db/schema";
import { LinkIcon } from "lucide-react";

interface ListHeaderProps {
  list: List,
  isOwner: boolean,
  copied: boolean,
  handleCopy: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function ListHeader({ list, isOwner, copied, handleCopy }: ListHeaderProps) {
  const ShareButton = () => {
    // Si es pública y el owner la ve, generamos link CON shared
    if (list.is_public && isOwner) {
      return (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
        >
          <LinkIcon className="w-4 h-4" /> 
          {copied ? "Shared link copied!" : "Share link"}
        </button>
      );
    }
    
    // Si es pública y NO es el owner, generamos link SIN shared
    if (list.is_public && !isOwner) {
      return (
        <button
          onClick={async () => {
            const url = `${window.location.origin}/lists/${list.slug}`;
            await navigator.clipboard.writeText(url);
          }}
          className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
        >
          <LinkIcon className="w-4 h-4" /> Share
        </button>
      );
    }
    
    // Si NO es pública y es el owner, generamos link CON shared
    if (!list.is_public && isOwner) {
      return (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
        >
          <LinkIcon className="w-4 h-4" /> 
          {copied ? "Shared link copied!" : "Generate private link"}
        </button>
      );
    }
    
    // Si NO es pública y NO es el owner, no mostramos botón
    return null;
  };

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{list.title}</h1>
        <ShareButton />
      </div>
      <p className="text-sm text-gray-400">{list.description}</p>
      <p className="text-xs text-gray-500">
        Created: {list.createdAt}
      </p>
    </header>
  );
}