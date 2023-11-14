import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { q } = pageContext.routeParams

  const searchResults = await apiClient.getShouts({ filters: { title: q, body: q }, limit: 50 })

  const pageProps: PageProps = { searchResults, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
