import { Root } from '../components/Root'

import { hydrate } from 'solid-js/web'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import type { PageContext } from './types'

let layoutReady = false

export const render = (pageContext: PageContextBuiltInClient & PageContext) => {
  const content = document.querySelector('#root')

  // If haven't rendered the layout yet, do so now.
  if (!layoutReady) {
    // Render the page.
    // This is the first page rendering; the page has been rendered to HTML,
    // and we now make it interactive.
    hydrate(() => <Root {...pageContext.pageProps} />, content!)
    layoutReady = true
  }
}
