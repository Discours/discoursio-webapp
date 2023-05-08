import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'
import { apiClient } from '../utils/apiClient'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams
  const article = await apiClient.getShoutBySlug(slug)

  const pageProps: PageProps = { article }

  return {
    pageContext: {
      pageProps
    }
  }
}
