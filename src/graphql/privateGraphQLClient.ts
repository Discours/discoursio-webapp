import { createClient, ClientOptions, dedupExchange, fetchExchange, Exchange } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'
import { isDev, apiBaseUrl } from '../utils/config'

const TOKEN_LOCAL_STORAGE_KEY = 'token'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
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

    const headers = { Auth: token }
    return { headers }
  },
  exchanges
}

export const privateGraphQLClient = createClient(options)
