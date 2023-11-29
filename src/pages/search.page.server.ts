import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { q: text } = pageContext.routeParams
  const searchResults = await apiClient.getShoutsSearch({ text, limit: 50 })
  const pageProps: PageProps = { searchResults, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
