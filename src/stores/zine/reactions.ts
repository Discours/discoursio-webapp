import type { Reaction, ReactionInput } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { createSignal } from 'solid-js'
// TODO: import { roomConnect } from '../../utils/p2p'

export const REACTIONS_AMOUNT_PER_PAGE = 100
const [sortedReactions, setSortedReactions] = createSignal<Reaction[]>([])
const [reactionsByShout, setReactionsByShout] = createSignal<{ [articleSlug: string]: Reaction[] }>({})

export const loadReactionsBy = async ({
  by,
  limit = REACTIONS_AMOUNT_PER_PAGE,
  offset = 0
}: {
  by
  limit?: number
  offset?: number
}): Promise<{ hasMore: boolean }> => {
  const data = await apiClient.getReactionsBy({ by, limit: limit + 1, offset })
  const hasMore = data.length === limit + 1
  if (hasMore) data.splice(-1)
  // TODO: const [data, provider] = roomConnect(articleSlug, username, "reactions")
  setSortedReactions(data)
  return { hasMore }
}

console.log('!!! sortedReactions():', sortedReactions())
export const createReaction = async (reaction: ReactionInput) => {
  try {
    const response = await apiClient.createReaction(reaction)

    console.log('!!! reaction:', response.data?.createReaction.reaction)
    const newReaction = response.data?.createReaction.reaction
    console.log('!!! newReaction:', newReaction)
    setSortedReactions((prev) => [...prev, response.data?.createReaction.reaction])
    console.log('!!! S:', sortedReactions())
    // return newReaction
  } catch (error) {
    console.error('[createReaction]', error)
  }
}
export const updateReaction = async (reaction: Reaction) => {
  const { reaction: r } = await apiClient.updateReaction({ reaction })
  return r
}

export const deleteReaction = async (reactionId: number) => {
  const resp = await apiClient.destroyReaction({ id: reactionId })
  console.debug(resp)
  return resp
}
export const useReactionsStore = () => {
  return {
    reactionsByShout,
    sortedReactions,
    createReaction,
    updateReaction,
    deleteReaction,
    loadReactionsBy
  }
}
