import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'

import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const allTopics = await apiClient.getAllTopics()

  const pageProps: PageProps = { allTopics, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
