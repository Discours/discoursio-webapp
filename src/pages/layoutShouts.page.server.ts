import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'
import { PRERENDERED_ARTICLES_COUNT } from './layoutShouts.page'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { layout } = pageContext.routeParams

  const layoutShouts = await apiClient.getShouts({ filters: { layout }, limit: PRERENDERED_ARTICLES_COUNT })

  const pageProps: PageProps = { layoutShouts }

  return {
    pageContext: {
      pageProps
    }
  }
}
