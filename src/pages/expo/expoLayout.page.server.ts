import type { PageContext } from '../../renderer/types'
import { apiClient } from '../../utils/apiClient'
import type { PageProps } from '../types'
import { PRERENDERED_ARTICLES_COUNT } from './expo.page.server'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { layout } = pageContext.routeParams
  const expoShouts = await apiClient.getShouts({
    filters: { layout: layout },
    limit: PRERENDERED_ARTICLES_COUNT
  })

  const pageProps: PageProps = { expoShouts }

  return {
    pageContext: {
      pageProps
    }
  }
}
