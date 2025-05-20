// src/app/lists/[id]/components/list-detail-page.tsx

import { Separator } from "@/components/ui/separator";
import { Book, Comment, List } from "@/db/schema";
import { LikeWithClerkUser } from "@/types/models/list-likes";
import { BookListDeletable } from "./BookListDeletable";
import CommentSection from "./comment-section";
import { LikesSection } from "./likes-section";
import { ListHeader } from "./list-header";
import { useSwitchOrganization } from "../hooks/use-switch-org";
import { useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import Image from "next/image";

export interface ListDetailPageProps {
  list: List;
  books: Book[];
  isOwner: boolean;
  isSignedIn: boolean;
  comments: Comment[];
  likes: LikeWithClerkUser[];
  copied: boolean;
  handleCopy: (e: React.MouseEvent<HTMLButtonElement>) => void;
  username: string;
  listOwner:
    | {
        id: string;
        clerk_user_id: string;
        name: string;
        avatar_url: string | null;
        bio: string;
        createdAt: string;
        email: string;
      }
    | undefined;
}

export function ListDetailPage({
  list,
  books,
  likes,
  isOwner,
  isSignedIn,
  comments,
  copied,
  handleCopy,
  username,
  listOwner,
}: ListDetailPageProps) {

  const { setActive } = useOrganizationList();
  const { organization, isLoaded } = useOrganization();
  const [error, setError] = useState('');

  useSwitchOrganization({
    isLoaded,
    organizationId: list.organization_id ?? undefined,
    currentOrgId: organization?.id,
    setActive: setActive ?? (async () => {}),
    setError,
  });

  console.log("organization", organization);
  

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera de la lista */}
        <ListHeader
          listOwner={listOwner}
          list={list}
          isOwner={isOwner}
          copied={copied}
          handleCopy={handleCopy}
        />

        {!list.is_public && (
        <div className="flex flex-col items-center space-y-2">
          {!isLoaded ? (
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <>
              {organization?.imageUrl && (
          <Image
            src={organization.imageUrl}
            alt="Organization"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full mx-auto"
          />
              )}
              {isOwner && organization?.setLogo && (
          <form>
            <input
              type="file"
              accept="image/*"
              className="mt-2"
              aria-label="Subir nuevo logo"
              onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
            try {
              await organization.setLogo({ file });
              window.location.reload(); // Opcional: recarga para ver el nuevo logo
            } catch (err) {
              setError("Error al subir el logo.");
            }
                }
              }}
            />
          </form>
              )}
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </>
          )}
        </div>
  )}

        <Separator className="border-white/20" />

        {/* Libros de la lista */}
        <BookListDeletable books={books} listId={list.id} canDelete={true} />

        <Separator className="border-white/20" />

        {/* Sección de likes*/}
        <LikesSection likes={likes} listId={list.id} />

        {/* Sección de comentarios */}
        {list.comments_enabled && (
          <CommentSection
            comments={comments}
            isPublic={list.is_public}
            isSignedIn={isSignedIn}
            listId={list.id}
            username={username}
          />
        )}
      </div>
    </main>
  );
}
