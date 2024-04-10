import type { PageContextBuiltInClientWithClientRouting } from 'vike/types'
import type { PageContext } from './types'

import * as Sentry from '@sentry/browser'
import i18next from 'i18next'
import HttpApi from 'i18next-http-backend'
import ICU from 'i18next-icu'
import { hydrate } from 'solid-js/web'

import { App } from '../components/App'
import { initRouter } from '../stores/router'
import { GLITCHTIP_DSN } from '../utils/config'
import { resolveHydrationPromise } from '../utils/hydrationPromise'

let layoutReady = false

export const render = async (pageContext: PageContextBuiltInClientWithClientRouting & PageContext) => {
  const { lng, pageProps, is404 } = pageContext

  const { pathname, search } = window.location
  const searchParams = Object.fromEntries(new URLSearchParams(search))
  initRouter(pathname, searchParams)

  Sentry.init({
    dsn: GLITCHTIP_DSN,
    tracesSampleRate: 0.01,
    integrations: [Sentry.replayIntegration()],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })

  // eslint-disable-next-line import/no-named-as-default-member
  await i18next
    .use(HttpApi)
    .use(ICU)
    .init({
      // debug: true,
      supportedLngs: ['ru', 'en'],
      fallbackLng: lng,
      lng,
      load: 'languageOnly',
    })

  const isIOSorMacOSorAndroid = /iphone|ipad|ipod|macintosh|android/i.test(navigator.userAgent)

  if (!isIOSorMacOSorAndroid) {
    const htmlEl = document.querySelector('html')
    htmlEl.dataset.customScroll = 'on'
  }

  const content = document.querySelector('#root')

  if (!layoutReady) {
    hydrate(() => <App {...pageProps} is404={is404} />, content)
    layoutReady = true
  }
}

export const onHydrationEnd = () => {
  resolveHydrationPromise()
}
