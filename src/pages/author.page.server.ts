import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { render } from 'vike/abort'

import { PRERENDERED_ARTICLES_COUNT } from '../components/Views/Author'
import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams

  const author = await apiClient.getAuthor({ slug })

  if (!author) {
    throw render(404)
  }
  const options = {
    filters: { author: slug, visibility: 'community' },
    limit: PRERENDERED_ARTICLES_COUNT,
  }
  const authorShouts = await apiClient.getShouts({ options })
  const pageProps: PageProps = { author, authorShouts, seo: { title: author.name } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
