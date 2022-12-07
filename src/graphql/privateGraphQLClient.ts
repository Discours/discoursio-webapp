import {
  ClientOptions,
  dedupExchange,
  fetchExchange,
  Exchange,
  subscriptionExchange,
  createClient
} from '@urql/core'
import { createClient as createSSEClient } from 'graphql-sse'
import { devtoolsExchange } from '@urql/devtools'
import { isDev, apiBaseUrl } from '../utils/config'
// import { cache } from './cache'

const TOKEN_LOCAL_STORAGE_KEY = 'token'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

export const getToken = (): string => {
  return localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)
}

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, token)
}

export const resetToken = () => {
  localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY)
}

const options: ClientOptions = {
  url: apiBaseUrl,
  maskTypename: true,
  requestPolicy: 'cache-and-network',
  fetchOptions: () => {
    // пока источником правды для значения токена будет локальное хранилище
    // меняем через setToken, например при получении значения с сервера
    // скорее всего придумаем что-нибудь получше со временем
    const token = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)
    if (token === null) alert('token is null')
    const headers = { Authorization: token }
    return { headers }
  },
  exchanges
}

export const privateGraphQLClient = createClient(options)

export const createChatClient = () => {
  const sseClient = createSSEClient({
    url: apiBaseUrl + '/messages'
  })

  const sseExchange = subscriptionExchange({
    forwardSubscription(operation) {
      return {
        subscribe: (sink) => {
          const dispose = sseClient.subscribe(operation, sink)
          return {
            unsubscribe: dispose
          }
        }
      }
    }
  })

  options.exchanges.unshift(sseExchange)
  return createClient(options)
}
