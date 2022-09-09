import { action, atom, WritableAtom } from 'nanostores'
import type { Reaction } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { apiClient } from '../../utils/apiClient'
import { reduceBy } from '../../utils/reduce'

export let reactionsOrdered: WritableAtom<Reaction[]>
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
  page,
  size
}: {
  articleSlug: string
  page: number
  size: number
}): Promise<void> => {
  const resp = await apiClient.getArticleReactions({ articleSlug, page, size })
  reactionsOrdered.set(resp)
}

export const loadReactions = async ({
  shoutSlugs,
  page,
  size
}: {
  shoutSlugs: string[]
  page: number
  size: number
}): Promise<void> => {
  const reactions = await apiClient.getReactionsForShouts({ shoutSlugs, page, size })
  reactionsOrdered.set(reactions)
}


export const createReaction = (reaction) =>
  action(reactionsOrdered, 'createReaction', async (store) => {
    store.set(await apiClient.createReaction({ reaction }))
  })

export const updateReaction = (reaction) =>
  action(reactionsOrdered, 'updateReaction', async (store) => {
    store.set(await apiClient.updateReaction({ reaction }))
  })

export const deleteReaction = (reaction_id) =>
  action(reactionsOrdered, 'deleteReaction', async (store) => {
    store.set(await apiClient.destroyReaction({ id: reaction_id }))
  })
