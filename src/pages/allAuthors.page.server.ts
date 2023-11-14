import type { PageContext } from '../renderer/types'
import { apiClient } from '../utils/apiClient'
import type { PageProps } from './types'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const allAuthors = await apiClient.getAllAuthors()

  const pageProps: PageProps = { allAuthors, seo: { title: '' } }

  return {
    pageContext: {
      pageProps,
    },
  }
}
