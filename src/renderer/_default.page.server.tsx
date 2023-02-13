import { generateHydrationScript, renderToString } from 'solid-js/web'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import { Root } from '../components/Root'
import { t } from '../utils/intl'
import { initRouter } from '../stores/router'
import type { PageContext } from './types'

export const passToClient = ['pageProps', 'documentProps']

export const render = (pageContext: PageContext) => {
  initRouter(pageContext.urlParsed.pathname, pageContext.urlParsed.search)

  console.log('render server', { pageContext })

  const rootContent = renderToString(() => <Root {...pageContext.pageProps} />)

  return escapeInject`<!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>${t('Discours')}</title>
        ${dangerouslySkipEscape(generateHydrationScript())}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(rootContent)}</div>
      </body>
    </html>`
}
