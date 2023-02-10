import type { Accessor, JSX, Resource } from 'solid-js'
import { createContext, createMemo, createResource, createSignal, onMount, useContext } from 'solid-js'
import type { AuthResult } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { t } from '../utils/intl'
import { useSnackbar } from './snackbar'

type SessionContextType = {
  session: Resource<AuthResult>
  isSessionLoaded: Accessor<boolean>
  userSlug: Accessor<string>
  isAuthenticated: Accessor<boolean>
  actions: {
    loadSession: () => AuthResult | Promise<AuthResult>
    signIn: ({ email, password }: { email: string; password: string }) => Promise<void>
    signOut: () => Promise<void>
    confirmEmail: (token: string) => Promise<void>
  }
}

const SessionContext = createContext<SessionContextType>()

export function useSession() {
  return useContext(SessionContext)
}

export const SessionProvider = (props: { children: JSX.Element }) => {
  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const getSession = async (): Promise<AuthResult> => {
    try {
      const authResult = await apiClient.getSession()
      if (!authResult) {
        return null
      }
      setToken(authResult.token)
      return authResult
    } catch (error) {
      console.error('getSession error:', error)
      resetToken()
      return null
    } finally {
      setIsSessionLoaded(true)
    }
  }

  const [session, { refetch: loadSession, mutate }] = createResource<AuthResult>(getSession, {
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
    showSnackbar({ body: t("You've successfully logged out") })
  }

  const confirmEmail = async (token: string) => {
    const authResult = await apiClient.confirmEmail({ token })
    mutate(authResult)
    setToken(authResult.token)
  }

  const actions = {
    loadSession,
    signIn,
    signOut,
    confirmEmail
  }

  const value: SessionContextType = { session, isSessionLoaded, userSlug, isAuthenticated, actions }

  onMount(() => {
    loadSession()
  })

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
