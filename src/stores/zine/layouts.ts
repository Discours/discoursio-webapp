import type { Shout } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { useArticlesStore } from './articles'
import { createSignal } from 'solid-js'
import { byCreated } from '../../utils/sortby'

export type LayoutType = 'article' | 'audio' | 'video' | 'image' | 'literature'

const [sortedLayoutShouts, setSortedLayoutShouts] = createSignal<Map<LayoutType, Shout[]>>(new Map())

const addLayoutShouts = (layout: LayoutType, shouts: Shout[]) => {
  setSortedLayoutShouts((prevSorted: Map<LayoutType, Shout[]>) => {
    const siblings = prevSorted.get(layout)
    if (siblings) {
      const uniqued = [...new Set([...siblings, ...shouts])]
      prevSorted.set(layout, uniqued)
    }
    return prevSorted
  })
}

export const resetSortedLayoutShouts = () => {
  setSortedLayoutShouts(new Map())
}

export const loadRecentLayoutShouts = async ({
  layout,
  amount,
  offset
}: {
  layout: LayoutType
  amount: number
  offset?: number
}): Promise<{ hasMore: boolean }> => {
  const layoutShouts: Shout[] = await apiClient.getRecentLayoutShouts({ layout, amount, offset })
  const hasMore = layoutShouts.length < amount
  if (hasMore) layoutShouts.splice(-1)
  const sortedArticles = layoutShouts.sort(byCreated)
  const { articlesByLayout } = useArticlesStore({ sortedArticles })
  addLayoutShouts(layout, articlesByLayout()[layout])
  return { hasMore }
}

export const loadTopMonthLayoutShouts = async (
  layout: LayoutType,
  amount: number,
  offset: number
): Promise<{ hasMore: boolean }> => {
  const shouts = await apiClient.getTopMonthLayoutShouts({ layout })
  const hasMore = shouts.length < amount
  if (hasMore) shouts.splice(-1)
  addLayoutShouts(layout, shouts)
  return { hasMore }
}

export const loadTopLayoutShouts = async (
  layout: LayoutType,
  amount,
  offset
): Promise<{ hasMore: boolean }> => {
  const shouts = await apiClient.getTopLayoutShouts({ layout })
  const hasMore = shouts.length < amount
  if (hasMore) shouts.splice(-1)
  addLayoutShouts(layout, shouts)
  return { hasMore }
}

export const loadSearchResults = async ({
  layout,
  query,
  limit,
  offset
}: {
  layout: LayoutType
  query: string
  limit?: number
  offset?: number
}): Promise<void> => {
  const newLayoutShouts = await apiClient.getSearchResults({ layout, query, limit, offset })
  addLayoutShouts(layout, newLayoutShouts)
}

type InitialState = {
  sortedLayoutShouts?: Shout[]
  topRatedLayoutShouts?: Shout[]
  topRatedMonthLayoutShouts?: Shout[]
}

export const useLayoutsStore = (layout: LayoutType, initialData: Shout[]) => {
  addLayoutShouts(layout, initialData || [])

  return {
    addLayoutShouts,
    sortedLayoutShouts,
    loadSearchResults,
    loadRecentLayoutShouts,
    loadTopMonthLayoutShouts,
    loadTopLayoutShouts
  }
}
