import { ClientOptions, Exchange, createClient, fetchExchange } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'

import { isDev } from '../utils/config'

const exchanges: Exchange[] = [fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

export const createGraphQLClient = (url: string, token = '') => {
  const options: ClientOptions = {
    url,
    requestPolicy: 'cache-and-network',
    fetchOptions: () => (token ? { headers: { Authorization: token } } : {}),
    exchanges,
  }
  return createClient(options)
}
