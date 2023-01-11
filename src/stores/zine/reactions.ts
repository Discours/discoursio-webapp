import type { Reaction, ReactionInput, User } from '../../graphql/types.gen'
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

export const createReaction = async (
  input: ReactionInput,
  createdBy: { name: string; userpic: string; slug: string }
) => {
  const reaction = await apiClient.createReaction(input)
  reaction.shout = { slug: input.shout }
  reaction.createdBy = createdBy
  setSortedReactions((prev) => [...prev, reaction])
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
