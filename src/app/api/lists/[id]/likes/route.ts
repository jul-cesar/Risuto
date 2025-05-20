import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { countLikesForList, getLikesWithClerk, getUserLikeForList, likeList, unlikeList } from '@/actions/likes-actions'


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id: listId } = await params;
  const userId = await currentUser() // o null si anónimo

  const [count, likes, userLike] = await Promise.all([
    countLikesForList(listId),
    getLikesWithClerk(listId),
    userId ? getUserLikeForList(listId, userId.id) : Promise.resolve(null),
  ])

  return NextResponse.json({ count, likes, userLike })
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id: listId } = await params;
  const { reactionId } = await req.json()
  const user = await currentUser()
  if (!user) return NextResponse.error()

  const result = await likeList(listId, user.id, reactionId)
  return NextResponse.json(result)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id: listId } = await params;
  const user = await currentUser()
  if (!user) return NextResponse.error()

  const result = await unlikeList(listId, user.id)
  return NextResponse.json(result)
}