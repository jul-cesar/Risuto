"use client";
import { List } from "@/db/schema";
import { formatDate } from "date-fns";
import { LinkIcon, UsersIcon } from "lucide-react";
import { InviteModal} from "./invite-modal";
import { useState } from "react";

interface ListHeaderProps {
  list: List;
  isOwner: boolean;
  copied: boolean;
  handleCopy: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ListHeader({
  list,
  isOwner,
  copied,
  handleCopy,
}: ListHeaderProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const ShareButton = () => {
    // Si es pública, mantenemos la lógica actual para compartir enlaces públicos
    if (list.is_public) {
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

    // Si NO es pública y es el owner, mostramos botón para invitar personas
    if (!list.is_public && isOwner && list.organization_id) {
      return (
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1 text-sm hover:text-zinc-400 transition-colors"
        >
          <UsersIcon className="w-4 h-4" />
          Invite members
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
        Created: {formatDate(list.createdAt, "dd/MM/yyyy")}
      </p>
      
      {/* Modal de invitación */}
      {showInviteModal && (
        <InviteModal 
          list={{
            id: list.id,
            title: list.title,
            organization_id: list.organization_id as string
          }}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </header>
  );
}