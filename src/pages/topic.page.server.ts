import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams

  const topic = await apiClient.getTopic({ slug })

  const pageProps: PageProps = { topic, seo: { title: topic.title } }

  return {
    pageContext: {
      pageProps
    }
  }
}
