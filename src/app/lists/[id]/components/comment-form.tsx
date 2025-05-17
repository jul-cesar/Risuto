'use client';

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { addComment } from "../actions/add-comment";
import { useFormStatus } from 'react-dom';

function FormButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="relative"
    >
      {pending ? (
        <>
          <span className="opacity-0">Publicar</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        </>
      ) : (
        "Publicar"
      )}
    </Button>
  );
}

// Componente del formulario (Client)
export function CommentForm({ 
  listId,
  username
}: { 
  listId: string;
  username: string;
}) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFormAction(formData: FormData) {
    const text = formData.get('text') as string;
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(text, username, listId);
      setNewComment("");
      formRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form 
      ref={formRef}
      action={handleFormAction} 
      className="space-y-2 relative"
    >
      {isSubmitting && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
          <div className="flex flex-col items-center space-y-2">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">Enviando comentario...</span>
          </div>
        </div>
      )}

      <Label htmlFor="new-comment" className="text-sm font-medium text-foreground">
        Añadir comentario
      </Label>
      <Textarea
        id="new-comment"
        name="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Escribe tu comentario..."
        rows={3}
        className="resize-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <FormButton />
      </div>
    </form>
  );
}