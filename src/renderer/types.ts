import type { PageContextBuiltIn } from 'vike/types'
import type { PageProps } from '../pages/types'
import type { Component } from 'solid-js'

export type PageContext = PageContextBuiltIn & {
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
