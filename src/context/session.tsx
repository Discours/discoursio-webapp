import type { Accessor, JSX, Resource } from 'solid-js'
import {
  createEffect,
  createContext,
  createMemo,
  createResource,
  createSignal,
  onMount,
  useContext
} from 'solid-js'
import type { AuthResult, User } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { useSnackbar } from './snackbar'
import { useLocalize } from './localize'
import { showModal } from '../stores/ui'
import type { AuthModalSource } from '../components/Nav/AuthModal/types'

type SessionContextType = {
  session: Resource<AuthResult>
  isSessionLoaded: Accessor<boolean>
  user: Accessor<User>
  isAuthenticated: Accessor<boolean>
  actions: {
    loadSession: () => AuthResult | Promise<AuthResult>
    requireAuthentication: (
      callback: (() => Promise<void>) | (() => void),
      modalSource: AuthModalSource
    ) => void
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
  const { t } = useLocalize()
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

  const user = createMemo(() => session()?.user)

  const isAuthenticated = createMemo(() => Boolean(session()?.user?.slug))

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const authResult = await apiClient.authLogin({ email, password })
    mutate(authResult)
    setToken(authResult.token)
    console.debug('signed in')
  }

  const [isAuthWithCallback, setIsAuthWithCallback] = createSignal(null)

  const requireAuthentication = (callback: () => void, modalSource: AuthModalSource) => {
    setIsAuthWithCallback(() => callback)

    if (!isAuthenticated()) {
      showModal('auth', modalSource)
    }
  }

  createEffect(async () => {
    if (isAuthWithCallback()) {
      const sessionProof = await session()

      if (sessionProof) {
        await isAuthWithCallback()()

        setIsAuthWithCallback(null)
      }
    }
  })

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
    requireAuthentication,
    signIn,
    signOut,
    confirmEmail
  }

  const value: SessionContextType = { session, isSessionLoaded, user, isAuthenticated, actions }

  onMount(() => {
    loadSession()
  })

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
