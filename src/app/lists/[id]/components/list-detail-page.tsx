// src/app/lists/[id]/components/list-detail-page.tsx

import { Separator } from "@/components/ui/separator";
import { Book, Comment, List } from "@/db/schema";
import { LikeWithClerkUser } from "@/types/models/list-likes";
import { BookListDeletable } from "./BookListDeletable";
import CommentSection from "./comment-section";
import { LikesSection } from "./likes-section";
import { ListHeader } from "./list-header";
import { useSwitchOrganization } from "../hooks/use-switch-org";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (setActive) {
      setActive({ organization: undefined });
    }
    setError('');
  }, [setActive]);

  useSwitchOrganization({
    isLoaded,
    organizationId: list.organization_id ?? undefined,
    currentOrgId: organization?.id,
    setActive: setActive ?? (async () => {}),
    setError,
  });

  

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
          isLoaded={isLoaded}
          organization={organization}
        />
        
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
