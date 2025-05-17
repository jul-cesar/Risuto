import { Separator } from "@/components/ui/separator";
import { Book, Comment, List } from "@/db/schema";
import { BookList } from "./book-list";
import { CommentSection } from "./comment-section";
import { ListHeader } from "./list-header";

interface ListDetail {
  
    books: ({
        id: string;
        title: string;
        author: string;
        synopsis: string;
        cover_url: string;
        is_trending: boolean | null;
        createdAt: string;
    } | null)[];
    id: string;
    user_id: string;
    slug: string | null;
    title: string;
    description: string;
    is_public: boolean;
    comments_enabled: boolean;
    createdAt: string;
    updatedAt: string;

}

interface ListDetailPageProps {
  list: ListDetail;
  isOwner: boolean;
  isSignedIn: boolean;
  comments: Comment[];
  copied: boolean;
  handleCopy: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onAddComment: (text: string) => Promise<void>;
}

export function ListDetailPage({
  list,
  isOwner,
  isSignedIn,
  comments,
  copied,
  handleCopy,
  onAddComment,
}: ListDetailPageProps) {
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
        <BookList books={list.books} />

        <Separator className="border-white/20" />

        {/* Sección de comentarios */}
        {list.comments_enabled && (
          <CommentSection
            comments={comments}
            isPublic={list.is_public}
            isSignedIn={isSignedIn}
            onAdd={onAddComment}
          />
        )}
      </div>
    </main>
  );
}
