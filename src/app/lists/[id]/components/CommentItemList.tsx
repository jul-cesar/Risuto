"use client";

import { deleteListComment, editListComment } from "@/actions/lists-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/db/schema";
import { formatCustomDate } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Check, Edit, MoreVertical, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItemList({ comment }: CommentItemProps) {
  const { user } = useUser();
  const isAuthor = user?.id === comment.user_id;
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Posicionar el cursor al final del texto
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editText.trim()) {
      const edit = await editListComment(user?.id ?? "", comment.id, editText);
      if (edit.success) {
        toast.success("Comentario editado");
        router.refresh();
      } else {
        toast.error("Error al editar el comentario");
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const del = await deleteListComment(user?.id ?? "", comment.id);
    if (del.success) {
      toast.success("Comentario eliminado");
      router.refresh();
    } else {
      toast.error("Error al eliminar el comentario");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className="bg-card rounded-md p-4 space-y-1 text-card-foreground relative">
      <div className="flex justify-between items-start">
        <p className="text-xs text-muted-foreground">
          {comment.commenter_name} &bull; {formatCustomDate(comment.createdAt)}
        </p>

        {isAuthor && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] text-sm"
            placeholder="Edita tu comentario..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="h-8 px-2 text-xs"
              disabled={!editText.trim()}
            >
              <Check className="mr-1 h-3 w-3" />
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm">{comment.text}</p>
      )}
    </div>
  );
}
