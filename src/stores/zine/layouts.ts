import type { LoadShoutsOptions, Shout } from '../../graphql/schema/core.gen'

import { createSignal } from 'solid-js'

import { apiClient } from '../../graphql/client/core'

export type LayoutType = 'article' | 'audio' | 'video' | 'image' | 'literature'

const [sortedLayoutShouts, setSortedLayoutShouts] = createSignal<Map<LayoutType, Shout[]>>(new Map())

const addLayoutShouts = (layouts: LayoutType[], shouts: Shout[]) => {
  setSortedLayoutShouts((prevSorted: Map<LayoutType, Shout[]>) => {
    layouts.forEach((layout: LayoutType) => {
      const siblings = prevSorted.get(layout)
      if (siblings) {
        const uniqued = [...new Set([...siblings, ...shouts])]
        prevSorted.set(layout, uniqued)
      }
    })

    return prevSorted
  })
}

export const resetSortedLayoutShouts = () => {
  setSortedLayoutShouts(new Map())
}

export const loadLayoutShoutsBy = async (options: LoadShoutsOptions): Promise<{ hasMore: boolean }> => {
  options.limit += 1
  const newLayoutShouts = await apiClient.getShouts(options)
  const hasMore = newLayoutShouts?.length === options.limit + 1

  if (hasMore) {
    newLayoutShouts.splice(-1)
  }
  addLayoutShouts(options.filters.layouts as LayoutType[], newLayoutShouts)

  return { hasMore }
}

export const useLayoutsStore = (layouts: LayoutType[], initialData: Shout[]) => {
  addLayoutShouts(layouts, initialData || [])

  return {
    addLayoutShouts,
    sortedLayoutShouts,
    loadLayoutShoutsBy,
  }
}
