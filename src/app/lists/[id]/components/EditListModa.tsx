"use client";

import type React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Edit2Icon, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { editList } from "@/actions/lists-actions";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

// Define el esquema de validación con Zod
const editListSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  is_public: z.boolean().default(true).optional(),
  comments_enabled: z.boolean().default(false).optional(),
});

type EditListValues = z.infer<typeof editListSchema>;

// Tipo para la lista
interface List {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  comments_enabled: boolean;
}

// Función para actualizar la lista (reemplazar con tu implementación real)

interface EditListDialogProps {
  list: List;
  trigger?: React.ReactNode;
}

export function EditListDialog({ list, trigger }: EditListDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<EditListValues>({
    resolver: zodResolver(editListSchema),
    defaultValues: {
      title: list.title,
      description: list.description || "",
      is_public: list.is_public,
      comments_enabled: list.comments_enabled,
    },
  });

  const onSubmit = async (values: EditListValues) => {
    setIsSubmitting(true);

    try {
      const result = await editList(list.id, values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (result.success) {
        toast.success("Lista actualizada correctamente");
        router.refresh();
        // Invalidar consultas para actualizar los datos en la UI

        setOpen(false);
      } else {
        toast.error(result.message || "Error al actualizar la lista");
      }
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Ocurrió un error al actualizar la lista");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Edit2Icon className="size-5 hover:" />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Edit2 className="h-5 w-5 mr-2" />
            Editar lista
          </DialogTitle>
          <DialogDescription>
            Actualiza los detalles de tu lista "{list.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mi lista de libros favoritos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Una breve descripción de esta lista..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: describe el propósito o contenido de esta lista
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Lista pública</FormLabel>
                      <FormDescription>
                        Permite que otros usuarios vean esta lista
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Permitir comentarios
                      </FormLabel>
                      <FormDescription>
                        Permite que otros usuarios comenten en esta lista
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
