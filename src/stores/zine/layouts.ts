import type { Shout, LoadShoutsOptions } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { createSignal } from 'solid-js'

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

export const loadLayoutShoutsBy = async (options: LoadShoutsOptions): Promise<{ hasMore: boolean }> => {
  const newLayoutShouts = await apiClient.getShouts({
    ...options,
    limit: options.limit + 1,
  })

  const hasMore = newLayoutShouts.length === options.limit + 1

  if (hasMore) {
    newLayoutShouts.splice(-1)
  }
  addLayoutShouts(options.filters.layout as LayoutType, newLayoutShouts)

  return { hasMore }
}

export const useLayoutsStore = (layout: LayoutType, initialData: Shout[]) => {
  addLayoutShouts(layout, initialData || [])

  return {
    addLayoutShouts,
    sortedLayoutShouts,
    loadLayoutShoutsBy,
  }
}
