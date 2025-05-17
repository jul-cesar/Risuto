// src/app/lists/[id]/components/list-detail-page.tsx
import { Book, Comment, List } from "@/db/schema";
import { Separator } from "@/components/ui/separator";
import { BookList } from "./book-list";
import { ListHeader } from "./list-header";
import CommentSection from "./comment-section";

export interface ListDetailPageProps {
  list: List;
  books: Book[];
  isOwner: boolean;
  isSignedIn: boolean;
  comments: Comment[];
  copied: boolean;
  handleCopy: (e: React.MouseEvent<HTMLButtonElement>) => void;
  username: string;
}

export function ListDetailPage({ 
  list, 
  books,
  isOwner, 
  isSignedIn, 
  comments, 
  copied, 
  handleCopy,
  username
} : ListDetailPageProps
) {
  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Cabecera de la lista */}
        <ListHeader 
          list={list} 
          isOwner={isOwner} 
          copied={copied}
          handleCopy={handleCopy}
        />
        
        <Separator className="border-white/20" />
        
        {/* Libros de la lista */}
        <BookList books={books} />
        
        <Separator className="border-white/20" />
        
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