import { ClientOptions, dedupExchange, fetchExchange, Exchange, createClient } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'

import { isDev } from '../utils/config'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

export const createGraphQLClient = (serviceName: string, token: string = '') => {
  const options: ClientOptions = {
    url: `https://${serviceName}.discours.io`,
    maskTypename: true,
    requestPolicy: 'cache-and-network',
    fetchOptions: () => (token ? { headers: { Authorization: token } } : {}),
    exchanges,
  }
  return createClient(options)
}
