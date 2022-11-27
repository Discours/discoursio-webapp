import type { Accessor, InitializedResource, JSX } from 'solid-js'
import { createContext, createMemo, createResource, onMount, useContext } from 'solid-js'
import type { AuthResult } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'

type SessionContextType = {
  session: InitializedResource<AuthResult>
  userSlug: Accessor<string>
  isAuthenticated: Accessor<boolean>
  actions: {
    getSession: () => AuthResult | Promise<AuthResult>
    signIn: ({ email, password }: { email: string; password: string }) => Promise<void>
    signOut: () => Promise<void>
    confirmEmail: (token: string) => Promise<void>
  }
}

const SessionContext = createContext<SessionContextType>()

const getSession = async (): Promise<AuthResult> => {
  try {
    const authResult = await apiClient.getSession()
    if (!authResult) {
      return null
    }
    setToken(authResult.token)
    return authResult
  } catch (error) {
    console.error('renewSession error:', error)
    resetToken()
    return null
  }
}

export function useSession() {
  return useContext(SessionContext)
}

export const SessionProvider = (props: { children: JSX.Element }) => {
  const [session, { refetch: refetchSession, mutate }] = createResource<AuthResult>(getSession, {
    ssrLoadFrom: 'initial',
    initialValue: null
  })

  const userSlug = createMemo(() => session()?.user?.slug)

  const isAuthenticated = createMemo(() => Boolean(session()?.user?.slug))

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const authResult = await apiClient.authLogin({ email, password })
    mutate(authResult)
    setToken(authResult.token)
    console.debug('signed in')
  }

  const signOut = async () => {
    // TODO: call backend to revoke token
    mutate(null)
    resetToken()
    console.debug('signed out')
  }

  const confirmEmail = async (token: string) => {
    const authResult = await apiClient.confirmEmail({ token })
    mutate(authResult)
    setToken(authResult.token)
  }

  const actions = {
    getSession: refetchSession,
    signIn,
    signOut,
    confirmEmail
  }

  const value: SessionContextType = { session, userSlug, isAuthenticated, actions }

  onMount(() => {
    refetchSession()
  })

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
