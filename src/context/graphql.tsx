import { Client, ClientOptions, cacheExchange, createClient, fetchExchange } from '@urql/core'
import { createContext, createEffect, createSignal, on, useContext } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { chatApiUrl, coreApiUrl } from '../config/config'
import { useSession } from './session'

type GraphQLClientContextType = Record<string, Client>

const GraphQLClientContext = createContext<GraphQLClientContextType>({} as GraphQLClientContextType)

// Function to create a GraphQL client based on the provided URL and token
const graphqlClientCreate = (url: string, token = ''): Client => {
  const exchanges = [fetchExchange, cacheExchange]
  const options: ClientOptions = {
    url,
    exchanges,
  }

  if (token) {
    options.fetchOptions = () => ({
      headers: {
        'content-type': 'application/json',
        authorization: token,
      },
    })
  }

  return createClient(options)
}

export const defaultClient = graphqlClientCreate(coreApiUrl)

export const GraphQLClientProvider = (props: { children?: JSX.Element }) => {
  const { session } = useSession()
  const [clients, setClients] = createSignal<GraphQLClientContextType>({ [coreApiUrl]: defaultClient })

  createEffect(
    on(
      () => session?.()?.access_token || '',
      (tkn: string) => {
        if (tkn) {
          console.info('[context.graphql] authorized client')
          setClients(() => ({
            [coreApiUrl]: graphqlClientCreate(coreApiUrl, tkn),
            [chatApiUrl]: graphqlClientCreate(chatApiUrl, tkn),
          }))
        } else {
          console.info('[context.graphql] can fetch data')
          setClients(() => ({
            [coreApiUrl]: defaultClient,
          }))
        }
      },
      { defer: true },
    ),
  )

  return <GraphQLClientContext.Provider value={clients()}>{props.children}</GraphQLClientContext.Provider>
}

export const useGraphQL = (url: string = coreApiUrl) => {
  const clients = useContext(GraphQLClientContext)
  let c = clients[coreApiUrl]
  if (url !== coreApiUrl) {
    try {
      c = clients[url]
    } catch (_e) {
      // pass
    }
  }
  if (!c) c = clients[coreApiUrl]
  return { query: c.query, mutation: c.mutation }
}
