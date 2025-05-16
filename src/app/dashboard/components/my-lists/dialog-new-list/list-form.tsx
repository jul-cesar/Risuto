import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

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
}

export function ListForm({
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
}: ListFormProps) {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <Label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My favorite sci-fi books"
          className="w-full"
        />
      </div>

      {/* Descripción */}
      <div>
        <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A list of my favorite sci-fi books..."
          className="w-full"
        />
      </div>

      {/* Visibilidad */}
      <div>
        <Label className="block text-sm font-medium text-foreground mb-1">
          Visibility
        </Label>
        <RadioGroup
          value={visibility}
          onValueChange={(val) => setVisibility(val as "public" | "private")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="vis-public" value="public" />
            <Label htmlFor="vis-public" className="text-sm text-foreground">
              Public
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="vis-private" value="private" />
            <Label htmlFor="vis-private" className="text-sm text-foreground">
              Private
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Comentarios */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="comments-enabled"
          checked={commentsEnabled}
          onCheckedChange={(chk) => setCommentsEnabled(!!chk)}
        />
        <Label htmlFor="comments-enabled" className="text-sm text-foreground">
          Allow comments
        </Label>
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1">
          Slug (optional)
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-favorite-sci-fi-books"
          className="w-full"
        />
      </div>
    </div>
  );
}
