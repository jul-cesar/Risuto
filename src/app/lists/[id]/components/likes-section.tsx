
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LikeWithClerkUser } from "@/types/models/list-likes";

interface LikesSectionProps {
  listId: string;
  likes: LikeWithClerkUser[];
  onToggleLike: (liked: boolean) => Promise<void>;
  initialLiked: boolean;
}

export function LikesSection({ listId, likes, onToggleLike, initialLiked }: LikesSectionProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likes.length);

  const handleLike = async () => {
    await onToggleLike(!liked);
    setLiked(!liked);
    setCount((prev) => prev + (liked ? -1 : 1));
  };

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant={liked ? "destructive" : "outline"}
        size="sm"
        onClick={handleLike}
      >
        {liked ? "Unlike" : "Like"}
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            {count} Like{count !== 1 ? "s" : ""}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Likes</DialogTitle>
            <DialogDescription>
              Usuarios que dieron like a esta lista
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64">
            <ul className="space-y-3 p-2">
              {likes.map((user) => (
                <li key={user.id} className="flex items-center space-x-3">
                  <Avatar>
                    {user.user.profileImageUrl ? (
                      <AvatarImage src={user.user.profileImageUrl} />
                    ) : (
                      <AvatarFallback>
                        {user.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.user.username}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <DialogClose asChild>
            <Button variant="outline" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
