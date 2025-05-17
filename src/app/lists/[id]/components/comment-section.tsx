import { MessageSquare } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Comment } from "@/db/schema";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "./comment-form";


export default function CommentSection({ 
  comments,
  isPublic,
  isSignedIn,
  listId,
  username
}: {
  comments: Comment[];
  isPublic: boolean;
  isSignedIn: boolean;
  listId: string;
  username: string;
}) {
  return (
    <section className="space-y-6">
      <h2 className="flex items-center text-lg font-semibold">
        <MessageSquare className="w-5 h-5 mr-2 text-foreground" />
        Comments
      </h2>
      <Separator />
      
      {/* Formulario de nuevo comentario */}
      {(!isPublic && !isSignedIn) ? (
        <div className="flex justify-center">
          <SignInButton mode="modal">
            <button className="text-sm underline hover:text-foreground transition">
              Inicia sesión para comentar
            </button>
          </SignInButton>
        </div>
      ) : (
        <CommentForm
          listId={listId}
          username={username}
        />
      )}
      
      <Separator />
      
      {/* Listado de comentarios */}
      {comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No hay comentarios aún
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
    </section>
  );
}



export function CommentItem({ comment } : { comment: Comment }) {
  return (
    <div className="bg-card rounded-md p-4 space-y-1 text-card-foreground">
      <p className="text-xs text-muted-foreground">
        {comment.commenter_name} &bull; {comment.createdAt}
      </p>
      <p className="text-sm">{comment.text}</p>
    </div>
  );
}