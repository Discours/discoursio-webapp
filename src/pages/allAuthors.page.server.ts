import type { PageContext } from '../renderer/types'
import type { PageProps } from './types'

import { PAGE_SIZE } from '../components/Views/AllTopics/AllTopics'
import { apiClient } from '../graphql/client/core'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const allAuthors = await apiClient.getAllAuthors()
  const topWritingAuthors = await apiClient.loadAuthorsBy({
    by: { order: 'shouts' },
    limit: PAGE_SIZE,
    offset: 0,
  })
  const topFollowedAuthors = await apiClient.loadAuthorsBy({
    by: { order: 'followers' },
    limit: PAGE_SIZE,
    offset: 0,
  })
  const pageProps: PageProps = { allAuthors, seo: { title: '' }, topWritingAuthors, topFollowedAuthors }

  return {
    pageContext: {
      pageProps
    }
  }
}
