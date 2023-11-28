import type { PageContext } from '../../renderer/types'
import type { PageProps } from '../types'

import { PRERENDERED_ARTICLES_COUNT } from '../../components/Views/Expo/Expo'
import { apiClient } from '../../graphql/client/core'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { layout } = pageContext.routeParams
  const expoShouts = await apiClient.getShouts({
    filters: { layouts: [layout] },
    limit: PRERENDERED_ARTICLES_COUNT,
  })

  const pageProps: PageProps = { expoShouts, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
