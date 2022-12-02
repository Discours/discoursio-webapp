import { ClientOptions, dedupExchange, fetchExchange, Exchange, createClient } from '@urql/core'
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
    if (token === null) console.error('[ERROR] token is null')
    const headers = { Authorization: token }
    return { headers }
  },
  exchanges
}

export const privateGraphQLClient = createClient(options)
