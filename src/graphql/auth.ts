import { errorExchange, makeOperation } from '@urql/core'
import { AuthConfig, authExchange } from '@urql/exchange-auth'
import type { GraphQLError } from 'graphql'
import refreshSession from './mutation/my-session'

const logout = () => {
  console.log('[graphql.auth] removing token from localStorage')
  localStorage.setItem('token', '')
}

type AuthStore = {
  operation?: any
  authState?: any
  error?: any
  mutate?: any
}

const willAuthError = (a: AuthStore) => {
  const { operation, authState } = a
  // Detect our "refreshSession" mutation and let this operation through:
  return (
    !authState &&
    !(
      operation.kind === 'mutation' &&
      // Here we find any mutation definition with the "refreshSession" field
      operation.query.definitions.some(
        (definition: { kind: string; selectionSet: { selections: any[] } }) => {
          return (
            definition.kind === 'OperationDefinition' &&
            definition.selectionSet.selections.some((node) => {
              // The field name is just an example, since signup may also be an exception
              return node.kind === 'Field' && node.name.value === 'refreshSession'
            })
          )
        }
      )
    )
  )
}

const didAuthError = (r: AuthStore) =>
  r?.error?.graphQLErrors?.some(
    (e: GraphQLError) => (e as any).response?.status === 401 || e.extensions?.code === 'FORBIDDEN'
  )

const addAuthToOperation = (a: AuthStore) => {
  const { authState, operation } = a

  if (!authState || !authState.token) {
    return operation
  }

  const fetchOptions =
    typeof operation.context.fetchOptions === 'function'
      ? operation.context.fetchOptions()
      : operation.context.fetchOptions || {}

  return makeOperation(operation.kind, operation, {
    ...operation.context,
    fetchOptions: { ...fetchOptions, headers: { ...fetchOptions.headers, Authorization: authState.token } }
  })
}

const getAuth = async (a: AuthStore) => {
  // initialize authState if needed
  const { authState, mutate } = a
  if (!authState) {
    const token = localStorage.getItem('token')
    if (token) {
      console.log('[graphql.auth] got token from localStorage')
      return { token }
    }
    return null
  }

  // refresh session token
  const result = await mutate(refreshSession, { token: authState.refreshToken })
  const r = result.data.refreshSession // TODO: backend should send refreshToken too
  if (r) {
    console.log('[graphql.auth] session was refreshed, save token to localStorage')
    localStorage.setItem('token', r.token)
    return r
  }

  // error
  console.log('[graphql.auth] remove token from localStorage', result)
  localStorage.setItem('token', '')
  logout()
  return null
}

export const authExchanges = [
  errorExchange({
    onError: (error: { graphQLErrors: any[] }) => {
      const isAuthError = error.graphQLErrors.some((e) => e.extensions?.code === 'FORBIDDEN')
      if (isAuthError) logout()
    }
  }),
  authExchange({
    addAuthToOperation,
    getAuth,
    didAuthError,
    willAuthError
  } as AuthConfig<any>)
]
