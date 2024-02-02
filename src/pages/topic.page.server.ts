import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { render } from 'vike/abort'

import { PRERENDERED_ARTICLES_COUNT } from '../components/Views/Topic'
import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams

  const topic = await apiClient.getTopic({ slug })

  if (!topic) {
    throw render(404)
  }

  const topicShouts = await apiClient.getShouts({
    filters: { topic: topic.slug, featured: true },
    limit: PRERENDERED_ARTICLES_COUNT,
  })

  const pageProps: PageProps = { topic, topicShouts, seo: { title: topic.title } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
