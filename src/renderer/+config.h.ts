import type { Config } from 'vike/types'

export default {
  clientRouting: true,
  hydrationCanBeAborted: true,
  passToClient: ['pageProps', 'lng', 'documentProps', 'is404']
} satisfies Config
