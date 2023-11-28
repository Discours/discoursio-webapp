import { ClientOptions, dedupExchange, fetchExchange, Exchange, createClient } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'

import { isDev, apiBaseUrl } from '../utils/config'

const TOKEN_LOCAL_STORAGE_KEY = 'token'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

export const getToken = (): string => {
  return localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)
}

export const setToken = (token: string) => {
  if (!token) {
    console.error('[privateGraphQLClient] setToken: token is null!')
  }

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
    try {
      // localStorage is the source of truth for now
      // to change token call setToken, for example after login
      const token = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)
      if (!token) {
        console.error('[privateGraphQLClient] fetchOptions: token is null!')
      }
      const headers = { Authorization: token }
      return { headers }
    } catch {
      return {}
    }
  },
  exchanges,
}

export const getPrivateClient = (name: string) =>
  createClient({
    ...options,
    url: `https://${name}.discours.io`,
  })
