import type { PageContext } from '../../renderer/types'
import { apiClient } from '../../utils/apiClient'
import type { PageProps } from '../types'
import { PRERENDERED_ARTICLES_COUNT } from '../../components/Views/Expo/Expo'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const expoShouts = await apiClient.getShouts({
    filters: { exclude_layout: 'article' },
    limit: PRERENDERED_ARTICLES_COUNT
  })
  const pageProps: PageProps = { expoShouts }
  return {
    pageContext: {
      pageProps
    }
  }
}
