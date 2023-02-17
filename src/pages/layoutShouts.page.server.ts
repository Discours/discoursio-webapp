import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { layout } = pageContext.routeParams

  const layoutShouts = await apiClient.getShouts({ filters: { layout }, limit: 50 })

  const pageProps: PageProps = { layoutShouts }

  return {
    pageContext: {
      pageProps
    }
  }
}
