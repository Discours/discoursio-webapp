import { ClientOptions, dedupExchange, fetchExchange, createClient, Exchange } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'
import { isDev, apiBaseUrl } from '../utils/config'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

const options: ClientOptions = {
  url: apiBaseUrl,
  maskTypename: true,
  requestPolicy: 'cache-and-network',
  exchanges
}

export const publicGraphQLClient = createClient(options)
