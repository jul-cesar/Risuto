import { Separator } from "@/components/ui/separator";

import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { MessageSquare } from "lucide-react";

import { BookComment } from "@/db/schema";
import { CommentItem } from "./CommentBookItem";
import { CommentForm } from "./CommentFormBook";

export default async function CommentSectionBook({
  comments,
  bookId,
}: {
  comments: BookComment[] | undefined;

  bookId: string;
}) {
  const user = await currentUser();

  const userId = user?.id;
  const isSignedIn = !!userId;
  const username = user?.username;
  return (
    <section className="space-y-6">
      <h2 className="flex items-center text-lg font-semibold">
        <MessageSquare className="w-5 h-5 mr-2 text-foreground" />
        Comments
      </h2>
      <Separator />

      {/* Formulario de nuevo comentario */}
      {!isSignedIn ? (
        <div className="flex justify-center">
          <SignInButton mode="modal">
            <button className="text-sm underline hover:text-foreground transition">
              Inicia sesión para comentar
            </button>
          </SignInButton>
        </div>
      ) : (
        <CommentForm bookId={bookId} username={username ?? ""} />
      )}

      <Separator />

      {/* Listado de comentarios */}
      {comments?.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No hay comentarios aún
        </div>
      ) : (
        <div className="space-y-4">
          {comments?.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
    </section>
  );
}
