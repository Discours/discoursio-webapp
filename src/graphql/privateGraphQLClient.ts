import { createClient, ClientOptions, dedupExchange, fetchExchange, Exchange } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'
import { authExchanges } from './auth'

const isDev = true

const TOKEN_LOCAL_STORAGE_KEY = 'token'

//export const baseUrl = 'http://localhost:8000'
export const baseUrl = 'https://newapi.discours.io'

const exchanges: Exchange[] = [dedupExchange, ...authExchanges, fetchExchange]

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
  url: baseUrl,
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
