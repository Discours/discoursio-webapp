import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'
import { PRERENDERED_ARTICLES_COUNT } from '../components/Views/Author'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams

  const authorShouts = await apiClient.getShouts({
    filters: { author: slug, visibility: 'community' },
    limit: PRERENDERED_ARTICLES_COUNT,
  })
  const author = await apiClient.getAuthor({ slug })

  const pageProps: PageProps = { author, authorShouts, seo: { title: author.name } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
