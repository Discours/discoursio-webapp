import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from '../components/types'
import { PRERENDERED_ARTICLES_COUNT, RANDOM_TOPICS_COUNT } from '../components/Views/Home'

export const onBeforeRender = async (pageContext: PageContext) => {
  const randomTopics = await apiClient.getRandomTopics({ amount: RANDOM_TOPICS_COUNT })
  const homeShouts = await apiClient.getShouts({
    filters: { visibility: 'public' },
    limit: PRERENDERED_ARTICLES_COUNT
  })

  const pageProps: PageProps = { randomTopics, homeShouts }

  console.log('index server', { pageProps })

  return {
    pageContext: {
      pageProps
    }
  }
}
