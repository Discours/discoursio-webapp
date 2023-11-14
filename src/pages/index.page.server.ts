import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { PRERENDERED_ARTICLES_COUNT } from '../components/Views/Home'
import { apiClient } from '../utils/apiClient'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const homeShouts = await apiClient.getShouts({
    filters: { visibility: 'public' },
    limit: PRERENDERED_ARTICLES_COUNT,
  })

  const pageProps: PageProps = { homeShouts, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
