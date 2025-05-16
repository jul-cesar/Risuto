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
  setSlug
} : ListFormProps
) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My reading list"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A list of my favorite science fiction books..."
        />
      </div>

      <div>
        <Label className="mb-1">Visibility</Label>
        <RadioGroup
          value={visibility}
          onValueChange={(val) =>
            setVisibility(val as "public" | "private")
          }
          className="flex space-x-4"
        >
          <Label htmlFor="vis-public" className="flex items-center space-x-1">
            <RadioGroupItem id="vis-public" value="public" />
            <span>Public</span>
          </Label>
          <Label htmlFor="vis-private" className="flex items-center space-x-1">
            <RadioGroupItem id="vis-private" value="private" />
            <span>Private</span>
          </Label>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="comments-enabled"
          checked={commentsEnabled}
          onCheckedChange={(chk) => setCommentsEnabled(!!chk)}
        />
        <Label htmlFor="comments-enabled">Turn on comments</Label>
      </div>

      <div>
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-reading-list"
        />
      </div>
    </div>
  );
}