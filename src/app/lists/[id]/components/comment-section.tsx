import { MessageSquare } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Comment } from "@/db/schema";

interface CommentSectionProps {
  comments: Comment[];
  isPublic: boolean;
  isSignedIn: boolean;
}

export function CommentSection({ comments, isPublic, isSignedIn }: CommentSectionProps) {
  return (
    <section>
      <h2 className="flex items-center text-lg mb-4">
        <MessageSquare className="w-5 h-5 mr-2" /> Comments
      </h2>
      
      {!isPublic && !isSignedIn ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          <SignInButton mode="modal">
            <button className="text-sm underline">Inicia sesión para comentar</button>
          </SignInButton>
        </div>
      ) : comments.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          No hay comentarios
        </div>
      ) : (
        <CommentList comments={comments} />
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