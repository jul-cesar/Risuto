"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";

export interface Invitation {
  id: string;
  emailAddress: string;
  role: string;
  roleName: string;
  status: 'pending' | 'accepted' | 'revoked';
  url: string;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
  publicOrganizationData: {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    has_image: boolean;
  };
}

interface InvitationDropdownProps {
  invitations: Invitation[];
}

export function InvitationDropdown({ invitations }: InvitationDropdownProps) {
  
  function getRoleBadgeClass(role: string): string {
    return role === "org:admin"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }

  return (
    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      <span className="sr-only">Ver invitaciones</span>
      {invitations.filter((inv) => inv.status === "pending").length > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-blue-600 " />
      )}
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" className="w-[450px]">
    <DropdownMenuLabel>Invitaciones</DropdownMenuLabel>
    <DropdownMenuSeparator />

    {invitations.filter((inv) => inv.status === "pending").length === 0 ? (
      <DropdownMenuItem disabled>
        No tienes invitaciones pendientes.
      </DropdownMenuItem>
    ) : (
      invitations
        .filter((inv) => inv.status === "pending")
        .map((invitation) => (
          <DropdownMenuItem
            key={invitation.id}
            className="flex flex-col items-start space-y-2 py-3 px-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <div className="flex items-start gap-3 w-full">
              <Image
                src={invitation.publicOrganizationData.image_url}
                alt={invitation.publicOrganizationData.name}
                width={40}
                height={40}
                className="rounded-full mt-1"
              />
              <div className="flex flex-col gap-1 w-full">
                <h2 className="text-sm font-semibold leading-tight">
                  {invitation.emailAddress}
                </h2>
                <h3 className="text-sm text-muted-foreground leading-snug">
                   Have been invited you to join{" "}
                  <span className="font-medium text-foreground">
                  {invitation.publicOrganizationData.name}
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(invitation.role)}`}
                  >
                    {invitation.role === "org:admin" ? "Admin" : "Member"}
                  </Badge>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Pending
                  </span>
                </div>

                <a
                  href={invitation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-fit"
                >
                  <Button
                    type="button"
                    className="bg-primary text-primary-foreground py-2 px-4 rounded flex items-center gap-2"
                  >
                    Accept invite
                  </Button>
                </a>
              </div>
            </div>
          </DropdownMenuItem>
        ))
    )}
  </DropdownMenuContent>
</DropdownMenu>

  );
}