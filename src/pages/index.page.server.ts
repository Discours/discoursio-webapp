import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'
import { PRERENDERED_ARTICLES_COUNT } from '../components/Views/Home'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const homeShouts = await apiClient.getShouts({
    filters: { visibility: 'public' },
    limit: PRERENDERED_ARTICLES_COUNT
  })

  const pageProps: PageProps = { homeShouts, seo: { title: '' } }

  return {
    pageContext: {
      pageProps
    }
  }
}
