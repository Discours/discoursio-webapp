import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageProps } from '../components/types'
import type { Component } from 'solid-js'

export type PageContext = PageContextBuiltIn & {
  Page: (pageProps: PageProps) => Component
  pageProps: PageProps
  documentProps?: {
    title?: string
    description?: string
  }
}
