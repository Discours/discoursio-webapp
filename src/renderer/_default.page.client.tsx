import { App } from '../components/App'
import { hydrate } from 'solid-js/web'
import type { PageContextBuiltInClientWithClientRouting } from 'vike/types'
import type { PageContext } from './types'
import { MetaProvider } from '@solidjs/meta'
import { use as useI18next, init as initI18next } from 'i18next'
import HttpApi from 'i18next-http-backend'
import * as Sentry from '@sentry/browser'
import { SENTRY_DSN } from '../utils/config'
import { resolveHydrationPromise } from '../utils/hydrationPromise'
import { initRouter } from '../stores/router'

let layoutReady = false

export const render = async (pageContext: PageContextBuiltInClientWithClientRouting & PageContext) => {
  const { lng, pageProps, is404 } = pageContext

  if (is404) {
    initRouter('/404')
  } else {
    const { pathname, search } = window.location
    const searchParams = Object.fromEntries(new URLSearchParams(search))
    initRouter(pathname, searchParams)
  }

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN
    })
  }

  useI18next(HttpApi)
  await initI18next({
    // debug: true,
    supportedLngs: ['ru', 'en'],
    fallbackLng: lng,
    lng,
    load: 'languageOnly'
  })

  const isIOSorMacOSorAndroid = /iphone|ipad|ipod|macintosh|android/i.test(navigator.userAgent)

  if (!isIOSorMacOSorAndroid) {
    const htmlEl = document.querySelector('html')
    htmlEl.dataset.customScroll = 'on'
  }

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

export const onHydrationEnd = () => {
  resolveHydrationPromise()
}
