import { ClientOptions, dedupExchange, fetchExchange, createClient, Exchange } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'
import { isDev } from '../utils/config'

// export const baseUrl = 'https://newapi.discours.io'
export const baseUrl = 'http://localhost:8000'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

const options: ClientOptions = {
  url: baseUrl,
  maskTypename: true,
  requestPolicy: 'cache-and-network',
  exchanges
}

export const publicGraphQLClient = createClient(options)
