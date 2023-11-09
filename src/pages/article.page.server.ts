import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'
import { apiClient } from '../utils/apiClient'
import { render } from 'vike/abort'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams
  const article = await apiClient.getShoutBySlug(slug)

  if (!article) {
    throw render(404, '/404')
  }

  const pageProps: PageProps = { article }

  return {
    pageContext: {
      pageProps
    }
  }
}
