import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PlusCircle } from "lucide-react";
import { getOwnLists } from "../actions/get-own-lists";
import { addToListAction } from "../actions/add-to-list";
import { currentUser } from "@clerk/nextjs/server";

const AddToListButton = async ({ bookId }: { bookId: string }) => {
  const user = await currentUser();
  if (!user) return null;

  const userLists = await getOwnLists(user.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-primary text-primary-foreground font-mono font-bold px-6 py-2 rounded-md hover:bg-gray-200 transition">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to list
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userLists.length > 0 ? (
          userLists.map((list) => (
            <form
              key={list.id}
              action={addToListAction}
              className="w-full"
            >
              <input type="hidden" name="bookId" value={bookId} />
              <input type="hidden" name="listId" value={list.id} />
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-left">
                  {list.title}
                </button>
              </DropdownMenuItem>
            </form>
          ))
        ) : (
          <DropdownMenuItem disabled>No lists found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToListButton;
