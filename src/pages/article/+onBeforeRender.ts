import type { PageContext } from '../../utils/types'
import type { PageProps } from '../../utils/types'

import { render } from 'vike/abort'

import { apiClient } from '../../graphql/client/core'

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
