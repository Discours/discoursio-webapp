import type { PageContext } from '../../renderer/types'
import { apiClient } from '../../utils/apiClient'
import type { PageProps } from '../types'

const PRERENDERED_ARTICLES_COUNT = 27
export const onBeforeRender = async (_pageContext: PageContext) => {
  const expoShouts = await apiClient.getShouts({
    filters: { excludeLayout: 'article' },
    limit: PRERENDERED_ARTICLES_COUNT
  })
  const pageProps: PageProps = { expoShouts }
  return {
    pageContext: {
      pageProps
    }
  }
}
