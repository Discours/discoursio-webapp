import type { PageContext } from '../../utils/types'
import type { PageProps } from '../../utils/types'

import { apiClient } from '../../graphql/client/core'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const allTopics = await apiClient.getAllTopics()

  const pageProps: PageProps = { allTopics, seo: { title: '' } }

  return {
    pageContext: {
      pageProps
    }
  }
}
