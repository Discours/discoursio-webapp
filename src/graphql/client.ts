import { Client, ClientOptions, cacheExchange, createClient, fetchExchange } from '@urql/core'
import { coreApiUrl } from '~/config'

// Функция для создания GraphQL клиента с заданным URL и токеном
export const graphqlClientCreate = (url: string, token = ''): Client => {
  const exchanges = [fetchExchange, cacheExchange]
  const options: ClientOptions = {
    url,
    exchanges
  }

  if (token) {
    options.fetchOptions = () => ({
      headers: {
        'content-type': 'application/json',
        authorization: token
      }
    })
  }

  return createClient(options)
}

export const defaultClient = graphqlClientCreate(coreApiUrl)
