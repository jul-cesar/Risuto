import { getOwnLists } from "../actions/get-own-lists";
import { currentUser } from "@clerk/nextjs/server";
import AddToListButtonClient from "./button-add-to-list-client";

interface Props {
  bookId: string
}

export default async function AddToListButton({ bookId }: Props) {
  const user = await currentUser()
  if (!user) return null

  const userLists = await getOwnLists(user.id)

  return (
    <AddToListButtonClient
      bookId={bookId}
      userLists={userLists}
    />
  )
}
