import { ClientOptions, dedupExchange, fetchExchange, Exchange } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'
import { isDev, apiBaseUrl } from '../utils/config'
import { initClient } from './client'
import { cache } from './cache'

const exchanges: Exchange[] = [dedupExchange, fetchExchange] //, cache]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

const options: ClientOptions = {
  url: apiBaseUrl,
  maskTypename: true,
  requestPolicy: 'cache-and-network',
  exchanges
}

export const publicGraphQLClient = initClient(options)
