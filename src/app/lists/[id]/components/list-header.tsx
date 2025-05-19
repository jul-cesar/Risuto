"use client";
import type { List } from "@/db/schema";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "date-fns";
import { Edit2, LinkIcon, Trash2, UsersIcon } from "lucide-react";
import { useState } from "react";
import { DeleteListDialog } from "./DeleteListDialog";
import { EditListDialog } from "./EditListModa";
import { InviteModal } from "./invite-modal";

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

  return (
    <header className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{list.title}</h1>

        {/* Barra de herramientas con botones de acción */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Botón de editar */}
            <EditListDialog
              list={list}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-full"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              }
            />

            {/* Botón de compartir */}
            {list.is_public ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-full"
                    onClick={handleCopy}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">
                      {copied ? "Copied!" : "Share"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy share link</TooltipContent>
              </Tooltip>
            ) : isOwner && list.organization_id ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-full"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Invite</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Invite members</TooltipContent>
              </Tooltip>
            ) : null}

            {/* Separador vertical */}
            <Separator orientation="vertical" className="h-8" />

            {/* Botón de eliminar */}
            <DeleteListDialog
              list={list}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              }
            />
          </div>
        </TooltipProvider>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-400">{list.description}</p>
        <p className="text-xs text-gray-500">
          Created: {formatDate(list.createdAt, "dd/MM/yyyy")}
        </p>
      </div>

      {showInviteModal && (
        <InviteModal
          list={{
            id: list.id,
            title: list.title,
            organization_id: list.organization_id as string,
          }}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </header>
  );
}
