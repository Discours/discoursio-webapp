import type { Reaction } from '../../graphql/types.gen'
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
  const data = await apiClient.loadReactionsBy({ by, limit: limit + 1, offset })
  const hasMore = data.length === limit + 1
  if (hasMore) data.splice(-1)
  // TODO: const [data, provider] = roomConnect(articleSlug, username, "reactions")
  setSortedReactions(data)
  return { hasMore }
}
export const createReaction = async (reaction: Reaction) => {
  const { reaction: r } = await apiClient.createReaction({ reaction })
  return r
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
export const useReactionsStore = (initialState: { reactions?: Reaction[] }) => {
  if (initialState.reactions) {
    setSortedReactions([...initialState.reactions])
  }

  return {
    reactionsByShout,
    sortedReactions,
    createReaction,
    updateReaction,
    deleteReaction,
    loadReactionsBy
  }
}
