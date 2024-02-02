import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { PRERENDERED_ARTICLES_COUNT } from '../components/Views/Home'
import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const homeShouts = await apiClient.getShouts({
    filters: { featured: true },
    limit: PRERENDERED_ARTICLES_COUNT,
  })

  const pageProps: PageProps = { homeShouts, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
