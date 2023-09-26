import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'
import { apiClient } from '../utils/apiClient'
import { RenderErrorPage } from 'vike/RenderErrorPage'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams
  const article = await apiClient.getShoutBySlug(slug)

  if (!article) {
    throw RenderErrorPage({ pageContext: {} })
  }

  const pageProps: PageProps = { article }

  return {
    pageContext: {
      pageProps
    }
  }
}
