"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ListForm } from "./list-form";

export function CreateListDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <ListForm closeModal={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
