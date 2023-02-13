import { Root } from '../components/Root'

import { hydrate } from 'solid-js/web'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import type { PageContext } from './types'

let layoutReady = false

export const render = (pageContext: PageContextBuiltInClient & PageContext) => {
  const content = document.querySelector('#root')

  console.log('render client', { pageContext })

  if (!layoutReady) {
    hydrate(() => <Root {...pageContext.pageProps} />, content)
    layoutReady = true
  }
}
