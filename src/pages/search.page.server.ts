import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'

import { apiClient } from '../graphql/client/core'
import { SearchResult } from '../graphql/schema/core.gen'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { q: text } = pageContext.routeParams
  const searchResults: SearchResult[] = await apiClient.getShoutsSearch({ text, limit: 50 })
  const pageProps: PageProps = { searchResults, seo: { title: '' } }

  return {
    pageContext: {
      pageProps
    }
  }
}
