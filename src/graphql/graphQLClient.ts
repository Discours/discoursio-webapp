import { ClientOptions, dedupExchange, fetchExchange, Exchange, createClient } from '@urql/core'
import { devtoolsExchange } from '@urql/devtools'
import { isServer } from 'solid-js/web'

import { isDev, apiBaseUrl } from '../utils/config'

const exchanges: Exchange[] = [dedupExchange, fetchExchange]

if (isDev) {
  exchanges.unshift(devtoolsExchange)
}

const TOKEN_LOCAL_STORAGE_KEY = 'token'

export const getToken = (): string => {
  return localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)
}

export const setToken = (token: string) => {
  if (!token) {
    console.error('[graphQLClient] setToken: token is null!')
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
    if (isServer) {
      return {}
    }
    // localStorage is the source of truth for now
    // to change token call setToken, for example after login
    const token = getToken()
    if (!token) {
      return {}
    }

    const headers = { Authorization: token }
    return { headers }
  },
  exchanges,
}

export const graphQLClient = createClient(options)
