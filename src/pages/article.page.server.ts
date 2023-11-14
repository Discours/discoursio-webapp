import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { render } from 'vike/abort'

import { apiClient } from '../utils/apiClient'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams
  const article = await apiClient.getShoutBySlug(slug)

  if (!article) {
    throw render(404, '/404')
  }

  const pageProps: PageProps = { article, seo: { title: article.title } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
