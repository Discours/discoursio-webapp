import type { PageProps } from './types'
import type { PageContext } from '../renderer/types'

import { render } from 'vike/abort'

import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (pageContext: PageContext) => {
  const { slug } = pageContext.routeParams

  const topic = await apiClient.getTopic({ slug })

  if (!topic) {
    throw render(404)
  }

  const pageProps: PageProps = { topic, seo: { title: topic.title } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
