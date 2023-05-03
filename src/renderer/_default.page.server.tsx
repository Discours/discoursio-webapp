import { generateHydrationScript, renderToString } from 'solid-js/web'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import { App } from '../components/App'
import { initRouter } from '../stores/router'
import type { PageContext } from './types'
import { MetaProvider, renderTags } from '@solidjs/meta'
import i18next, { changeLanguage, init as initI18next } from 'i18next'
import ru from '../../public/locales/ru/translation.json'
import en from '../../public/locales/en/translation.json'
import type { Language } from '../context/localize'

export const passToClient = ['pageProps', 'lng', 'documentProps']

const metaTags = []

const getLng = (pageContext: PageContext): Language => {
  const { urlParsed, cookies } = pageContext

  if (urlParsed.search.lng) {
    return urlParsed.search.lng === 'en' ? 'en' : 'ru'
  }

  if (cookies?.lng === 'en') {
    return 'en'
  }

  return 'ru'
}

export const render = async (pageContext: PageContext) => {
  const lng = getLng(pageContext)

  if (!i18next.isInitialized) {
    // eslint-disable-next-line import/no-named-as-default-member
    await initI18next({
      // debug: true,
      supportedLngs: ['ru', 'en'],
      fallbackLng: lng,
      initImmediate: false,
      lng,
      resources: {
        ru: { translation: ru },
        en: { translation: en }
      }
    })
  } else if (i18next.language !== lng) {
    await changeLanguage(lng)
  }

  initRouter(pageContext.urlParsed.pathname, pageContext.urlParsed.search)

  pageContext.lng = lng

  const rootContent = renderToString(() => (
    <MetaProvider tags={metaTags}>
      <App {...pageContext.pageProps} />
    </MetaProvider>
  ))

  return escapeInject`<!DOCTYPE html>
    <html lang="${lng}">
      <head>
        ${dangerouslySkipEscape(renderTags(metaTags))}
        ${dangerouslySkipEscape(generateHydrationScript())}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(rootContent)}</div>
      </body>
    </html>`
}
