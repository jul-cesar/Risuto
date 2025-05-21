// hooks/useListLikes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LikeWithClerkUser } from '@/types/models/list-likes'
import { useUser } from '@clerk/nextjs'

type LikesResponse = {
  count: number
  likes: LikeWithClerkUser[]
  userLike: LikeWithClerkUser | null
}

const fetchLikes = async (listId: string): Promise<LikesResponse> => {
  const res = await fetch(`/api/lists/${listId}/likes`)
  if (!res.ok) throw new Error('Error fetching likes')
  return res.json()
}

const postLike = async ({
  listId,
  reactionId,
}: {
  listId: string
  reactionId: string
}) => {
  const res = await fetch(`/api/lists/${listId}/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reactionId }),
  })
  if (!res.ok) throw new Error('Error adding like')
  return res.json()
}

const deleteLike = async (listId: string) => {
  const res = await fetch(`/api/lists/${listId}/likes`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Error removing like')
  return res.json()
}

export default function useListLikes(listId: string, defaultReactionId: string) {
  const queryClient = useQueryClient()
  const { user } = useUser(); // Get user at the top level

  // 1. Query para cargar count, likes y el like actual del usuario
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<LikesResponse>({
    queryKey: ['listLikes', listId],
    queryFn: () => fetchLikes(listId),
    staleTime: 30_000, // 30s cache
  })

  // 2. Mutation de "like" (POST)
  const likeMutation = useMutation(
    (reactionId: string) => postLike({ listId, reactionId }),
    {
      // Optimistic update antes de la llamada
      onMutate: async (reactionId) => {
        await queryClient.cancelQueries(['listLikes', listId])
        const previous = queryClient.getQueryData<LikesResponse>(['listLikes', listId])
        if (previous) {
          // Asumiendo que ya tienes la info mínima del usuario en el cliente:
          if (!user) {
            return { previous };
          }
          const newLike: LikeWithClerkUser = {
            id: 'temp-' + Date.now(),
            list_id: listId,
            user_id: user.id,
            createdAt: new Date().toISOString(),
            reaction: { id: reactionId, code: '', label: '', icon: '' }, 
            user: {
              id: user.id,
              username: user.username ?? '',
              profileImageUrl: user.imageUrl ?? '',
            },
          }
          queryClient.setQueryData<LikesResponse>(['listLikes', listId], {
            count: previous.userLike ? previous.count : previous.count + 1,
            likes: [...previous.likes, newLike],
            userLike: newLike,
          })
        }
        return { previous }
      },
      onError: (_err, _vars, context?: { previous?: LikesResponse }) => {
        if (context?.previous) {
          queryClient.setQueryData(['listLikes', listId], context.previous)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['listLikes', listId])
      },
    }
  )

  // 3. Mutation de "unlike" (DELETE)
  const unlikeMutation = useMutation({
    mutationFn: () => deleteLike(listId),
    onMutate: async () => {
      await queryClient.cancelQueries(['listLikes', listId])
      const previous = queryClient.getQueryData<LikesResponse>(['listLikes', listId])
      if (previous && previous.userLike) {
        const newLikes = previous.likes.filter(
          l => l.user_id !== previous.userLike!.user_id
        )
        queryClient.setQueryData<LikesResponse>(['listLikes', listId], {
          count: newLikes.length,
          likes: newLikes,
          userLike: null,
        })
      }
      return { previous }
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['listLikes', listId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['listLikes', listId])
    },
  })

  return {
    count: data?.count ?? 0,
    likes: data?.likes ?? [],
    userLike: data?.userLike ?? null,
    isLoading,
    isError, 
    refetch,
    like: (reactionId: string = defaultReactionId) => likeMutation.mutate(reactionId),
    unlike: () => unlikeMutation.mutate(),
  }
}
