import type { PageContext } from '../../utils/types'
import type { PageProps } from '../../utils/types'

import { apiClient } from '../../graphql/client/core'

export const onBeforeRender = async (_pageContext: PageContext) => {
  const allAuthors = await apiClient.getAllAuthors()

  const pageProps: PageProps = { allAuthors, seo: { title: '' } }

  return {
    pageContext: {
      pageProps
    }
  }
}
