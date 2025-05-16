import { MessageSquare } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Comment } from "@/db/schema";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  comments: Comment[];
  isPublic: boolean;
  isSignedIn: boolean;
  onAdd: (text: string) => Promise<void>;
}

export function CommentSection({ comments, isPublic, isSignedIn, onAdd }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    await onAdd(newComment.trim());
    setNewComment("");
    setSubmitting(false);
  };

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
        <div className="space-y-2">
          <Label htmlFor="new-comment" className="text-sm font-medium text-foreground">Añadir comentario</Label>
          <Textarea
            id="new-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting || !newComment.trim()}>
              {submitting ? "Enviando..." : "Publicar"}
            </Button>
          </div>
        </div>
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
            <div key={c.id} className="bg-card rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                {c.commenter_name} • {new Date(c.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}



export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

export function CommentItem({ comment } : { comment: Comment }) {
  return (
    <div className="bg-card rounded-md p-4 space-y-1 text-card-foreground">
      <p className="text-xs text-muted-foreground">
        {comment.commenter_name} &bull; {new Date(comment.createdAt).toLocaleDateString()}
      </p>
      <p className="text-sm">{comment.text}</p>
    </div>
  );
}