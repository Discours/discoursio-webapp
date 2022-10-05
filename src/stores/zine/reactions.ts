import { atom, WritableAtom } from 'nanostores'
import type { Reaction } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { apiClient } from '../../utils/apiClient'
import { reduceBy } from '../../utils/reduce'
// import { roomConnect } from '../../utils/p2p'
// FIXME

let reactionsOrdered: WritableAtom<Reaction[]>
export const reactions = atom<{ [slug: string]: Reaction[] }>({}) // by shout

export const useReactionsStore = (initial?: Reaction[]) => {
  if (!reactionsOrdered) {
    reactionsOrdered = atom(initial || [])
    reactionsOrdered.listen((rrr: Reaction[]) => reactions.set(reduceBy(rrr, 'shout')))
  }
  return useStore(reactionsOrdered)
}

export const loadArticleReactions = async ({
  articleSlug,
  limit = 100,
  offset = 0
}: {
  articleSlug: string
  limit?: number
  offset?: number
}): Promise<void> => {
  const data = await apiClient.getArticleReactions({ articleSlug, limit, offset })
  // TODO: const [data, provider] = roomConnect(articleSlug, username, "reactions")
  reactionsOrdered.set(data)
}

export const loadReactions = async ({
  shoutSlugs,
  limit = 100,
  offset = 0
}: {
  shoutSlugs: string[]
  limit: number
  offset: number
}): Promise<void> => {
  const reactionsForShouts = await apiClient.getReactionsForShouts({ shoutSlugs, limit, offset })
  reactionsOrdered.set(reactionsForShouts)
}

export const createReaction = async (reaction: Reaction) =>
  // FIXME
  reactionsOrdered.set(await apiClient.createReaction({ reaction }))

export const updateReaction = async (reaction: Reaction) =>
  // FIXME
  reactionsOrdered.set(await apiClient.updateReaction({ reaction }))

export const deleteReaction = async (reactionId: number) =>
  // FIXME
  reactionsOrdered.set(await apiClient.destroyReaction({ id: reactionId }))
