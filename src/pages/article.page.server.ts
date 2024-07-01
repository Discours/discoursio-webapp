import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'

import { render } from 'vike/abort'

import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams
  const article = await apiClient.getShoutBySlug(slug)

  if (!article) {
    throw render(404)
  }

  const pageProps: PageProps = { article, seo: { title: article.title } }

  return {
    pageContext: {
      pageProps
    }
  }
}
