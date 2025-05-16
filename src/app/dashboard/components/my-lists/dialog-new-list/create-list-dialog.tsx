import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ListForm } from "./list-form";

interface ListFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  visibility: "public" | "private";
  setVisibility: (visibility: "public" | "private") => void;
  commentsEnabled: boolean;
  setCommentsEnabled: (commentsEnabled: boolean) => void;
  slug: string;
  setSlug: (slug: string) => void;
  handleCreate: () => void;
}


export function CreateListDialog({
  title,
  setTitle,
  description,
  setDescription,
  visibility,
  setVisibility,
  commentsEnabled,
  setCommentsEnabled,
  slug,
  setSlug,
  handleCreate
} : ListFormProps
) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center text-sm hover:underline space-x-1">
          <Plus className="w-5 h-5" />
          <span>New list</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md background rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-center font-mono text-lg">
            Create new list
          </DialogTitle>
        </DialogHeader>

        <ListForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          visibility={visibility}
          setVisibility={setVisibility}
          commentsEnabled={commentsEnabled}
          setCommentsEnabled={setCommentsEnabled}
          slug={slug}
          setSlug={setSlug}
        />

        <DialogFooter className="mt-6 flex justify-center">
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}