import type { PageProps } from '../pages/types'
import type { Component } from 'solid-js'

import { PageContextBuiltInClientWithClientRouting } from 'vike/dist/esm/types'

export type PageContext = PageContextBuiltInClientWithClientRouting & {
  Page: (pageProps: PageProps) => Component
  pageProps: PageProps
  lng: string
  // FIXME typing
  cookies: any
  documentProps?: {
    title?: string
    description?: string
  }
}
