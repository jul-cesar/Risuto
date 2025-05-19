"use client";

import type React from "react";

import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Función para eliminar la lista (reemplazar con tu implementación real)
async function deleteList(
  listId: string
): Promise<{ success: boolean; message?: string }> {
  // Simular una llamada a la API
  await new Promise((resolve) => setTimeout(resolve, 800));

  // En una implementación real, aquí harías una llamada a tu API
  return { success: true };
}

interface DeleteListDialogProps {
  list: {
    id: string;
    title: string;
  };
  trigger?: React.ReactNode;
  onDeleted?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteListDialog({
  list,
  trigger,
  onDeleted,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteListDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Determinar si el componente está controlado externamente
  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleDelete = async () => {
    if (confirmText !== list.title) {
      toast.error(
        "Por favor, escribe el nombre exacto de la lista para confirmar"
      );
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteList(list.id);

      if (result.success) {
        toast.success("Lista eliminada correctamente");
        // Invalidar consultas para actualizar los datos en la UI
        queryClient.invalidateQueries(["lists"]);
        setOpen(false);

        // Ejecutar callback si existe
        if (onDeleted) {
          onDeleted();
        }

        // Opcional: redirigir a otra página
        // router.push('/dashboard/lists')
      } else {
        toast.error(result.message || "Error al eliminar la lista");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Ocurrió un error al eliminar la lista");
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmDisabled = confirmText !== list.title || isDeleting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Eliminar lista
          </DialogTitle>
          <DialogDescription className="pt-2">
            ¿Estás seguro de que quieres eliminar la lista{" "}
            <span className="font-medium">"{list.title}"</span>? Esta acción no
            se puede deshacer y todos los libros asociados a esta lista serán
            desvinculados.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 my-2">
          <div className="flex items-center text-sm text-destructive mb-3">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="font-medium">Esta acción es permanente</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Para confirmar, escribe el nombre exacto de la lista:{" "}
            <span className="font-medium">{list.title}</span>
          </p>
        </div>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-text" className="text-sm font-medium">
            Confirmar nombre de la lista
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Escribe "${list.title}"`}
            className={
              confirmText !== list.title
                ? "border-destructive/50"
                : "border-green-500"
            }
            autoComplete="off"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isConfirmDisabled}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Eliminar permanentemente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
