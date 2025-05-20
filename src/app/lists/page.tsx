import { getUserClerk } from "@/actions/clerk-actions";
import { getAllLists } from "@/actions/lists-actions";
import { ListCard } from "./components/list-card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getListsLikedByUser } from "@/actions/likes-actions";
import { currentUser } from "@clerk/nextjs/server";

type ListDataItem = NonNullable<Awaited<ReturnType<typeof getAllLists>>["data"]>[0];

interface ListWithBooksAndUser extends ListDataItem {
  user: {
    id: string;
    fullName: string;
    username: string;
    profileImageUrl: string;
  };
}

export default async function ListsPage() {
  
  const user = await currentUser();
  const responseAllLists = await getAllLists();
  const allLists = responseAllLists.data ?? [];
  
  const listsWithUser: ListWithBooksAndUser[] = await Promise.all(
    allLists.map(async (list) => {
      const u = await getUserClerk(list.user_id);
      return {
        ...list,
        user: {
          id: u.id,
          fullName: u.fullName ?? u.username ?? "Unknown",
          username: u.username ?? "unknown",
          profileImageUrl: u.imageUrl!,
        },
      };
    })
  ); 

  const responselikedLists = await getListsLikedByUser(user?.id ?? "");
  const likedLists = responselikedLists.data ?? [];
   const listsLikedWithUser: ListWithBooksAndUser[] = await Promise.all(
    likedLists.map(async (list) => {
      const u = await getUserClerk(list.user_id);
      return {
        ...list,
        user: {
          id: u.id,
          fullName: u.fullName ?? u.username ?? "Unknown",
          username: u.username ?? "unknown",
          profileImageUrl: u.imageUrl ?? "",
        },
      };
    })
  );

  return (
    <main className="flex-1 bg-gradient-to-b from-background-secondary to-background text-foreground font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-2xl">🔥 Last added lists</h1>
        </header>

        <Tabs defaultValue="All public lists">
          <TabsList className ="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value ="All public lists">All public lists</TabsTrigger>
            <TabsTrigger value ="My lists">My lists</TabsTrigger>
            <TabsTrigger value ="Liked lists">Liked lists</TabsTrigger>
          </TabsList>
          <TabsContent value="All public lists">
            {/* Lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listsWithUser.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="My lists">
            

          </TabsContent>
          <TabsContent value="Liked lists">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listsLikedWithUser.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
