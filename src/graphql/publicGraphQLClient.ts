import { ClientOptions, dedupExchange, fetchExchange, Exchange, createClient } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'

import { isDev } from '../utils/config'
// import { cache } from './cache'

const exchanges: Exchange[] = [dedupExchange, fetchExchange] //, cache]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

const options: ClientOptions = {
  url: '',
  maskTypename: true,
  requestPolicy: 'cache-and-network',
  exchanges,
}

export const getPublicClient = (name: string) =>
  createClient({
    ...options,
    url: `https://${name}.discours.io`,
  })
