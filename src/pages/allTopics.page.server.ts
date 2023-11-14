import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const allTopics = await apiClient.getAllTopics()

  const pageProps: PageProps = { allTopics, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
