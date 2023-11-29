import type { PageContext } from '../../renderer/types'
import type { PageProps } from '../types'

import { PRERENDERED_ARTICLES_COUNT } from '../../components/Views/Expo/Expo'
import { apiClient } from '../../graphql/client/core'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const options = {
    filters: { layouts: ['audio', 'video', 'literature', 'image'] },
    limit: PRERENDERED_ARTICLES_COUNT,
  }
  const expoShouts = await apiClient.getShouts({ options })
  const pageProps: PageProps = { expoShouts, seo: { title: '' } }
  return {
    pageContext: {
      pageProps,
    },
  }
}
