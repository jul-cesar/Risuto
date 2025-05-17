"use client";

import { createList } from "@/actions/lists-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { NewList } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the validation schema with Zod
const listFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  visibility: z.enum(["public", "private"]),
  commentsEnabled: z.boolean(),
  slug: z.string().optional(),
});

export type ListFormValues = z.infer<typeof listFormSchema>;

interface ListFormProps {
  defaultValues?: Partial<ListFormValues>;
}

export function ListForm({
  defaultValues = {
    title: "",
    description: "",
    visibility: "public" as const,
    commentsEnabled: false,
    slug: "",
  },
  closeModal,
}: ListFormProps & { closeModal: () => void }) {
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues,
  });
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async ({
    commentsEnabled,
    title,
    description,
    visibility,
    slug,
  }: ListFormValues) => {
    setLoading(true);
    const newList: NewList = {
      user_id: user?.id ?? "",
      title,
      description,
      slug: slug || null,
      is_public: visibility === "public",
      comments_enabled: commentsEnabled,
    };
    const res = await createList(newList);
    if (!res.success) {
      setLoading(false);
      return;
    }
    queryClient.invalidateQueries(["dashboardData"]);
    setLoading(false);
    closeModal();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="My favorite sci-fi books"
                  className="w-full"
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
              <FormLabel className="text-sm font-medium text-foreground">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="A list of my favorite sci-fi books..."
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm font-medium text-foreground">
                Visibility
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="vis-public" value="public" />
                    <Label
                      htmlFor="vis-public"
                      className="text-sm text-foreground"
                    >
                      Public
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="vis-private" value="private" />
                    <Label
                      htmlFor="vis-private"
                      className="text-sm text-foreground"
                    >
                      Private
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commentsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="comments-enabled"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel
                  htmlFor="comments-enabled"
                  className="text-sm text-foreground"
                >
                  Allow comments
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                Slug (optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="my-favorite-sci-fi-books"
                  className="w-full"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create List"}
        </Button>
      </form>
    </Form>
  );
}
