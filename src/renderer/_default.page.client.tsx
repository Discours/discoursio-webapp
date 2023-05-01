import { App } from '../components/App'

import { hydrate } from 'solid-js/web'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import type { PageContext } from './types'
import { MetaProvider } from '@solidjs/meta'
import { use as useI18next, init as initI18next } from 'i18next'
import HttpApi from 'i18next-http-backend'

let layoutReady = false

export const render = async (pageContext: PageContextBuiltInClient & PageContext) => {
  const { lng, pageProps } = pageContext

  useI18next(HttpApi)
  await initI18next({
    // debug: true,
    supportedLngs: ['ru', 'en'],
    fallbackLng: lng,
    lng,
    load: 'languageOnly'
  })

  const content = document.querySelector('#root')

  if (!layoutReady) {
    hydrate(
      () => (
        <MetaProvider>
          <App {...pageProps} />
        </MetaProvider>
      ),
      content
    )
    layoutReady = true
  }
}
