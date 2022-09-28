import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from '../components/types'

export const onBeforeRender = async (pageContext: PageContext) => {
  const randomTopics = await apiClient.getRandomTopics({ amount: 12 })
  const articles = await apiClient.getRecentPublishedArticles({ limit: 5 })

  const pageProps: PageProps = { randomTopics, articles }

  return {
    pageContext: {
      pageProps
    }
  }
}
