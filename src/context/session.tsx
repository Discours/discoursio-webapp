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
import type { AuthResult, MySubscriptionsQueryResult, User } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { useSnackbar } from './snackbar'
import { useLocalize } from './localize'
import { showModal } from '../stores/ui'
import type { AuthModalSource } from '../components/Nav/AuthModal/types'

type SessionContextType = {
  session: Resource<AuthResult>
  isSessionLoaded: Accessor<boolean>
  subscriptions: Accessor<MySubscriptionsQueryResult>
  user: Accessor<User>
  isAuthenticated: Accessor<boolean>
  actions: {
    loadSession: () => AuthResult | Promise<AuthResult>
    loadSubscriptions: () => Promise<void>
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
  const [subscriptions, setSubscriptions] = createSignal<MySubscriptionsQueryResult>({
    topics: [],
    authors: []
  })
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
      loadSubscriptions()
      return authResult
    } catch (error) {
      console.error('getSession error:', error)
      resetToken()
      return null
    } finally {
      setTimeout(() => {
        setIsSessionLoaded(true)
      }, 0)
    }
  }

  const loadSubscriptions = async (): Promise<void> => {
    const result = await apiClient.getMySubscriptions()
    setSubscriptions(result)
  }

  const [session, { refetch: loadSession, mutate }] = createResource<AuthResult>(getSession, {
    ssrLoadFrom: 'initial',
    initialValue: null
  })

  const user = createMemo(() => session()?.user)

  const isAuthenticated = createMemo(() => Boolean(session()?.user?.slug))

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const authResult = await apiClient.authLogin({ email, password })
    setToken(authResult.token)
    mutate(authResult)
    loadSubscriptions()
    // console.debug('signed in')
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
    setToken(authResult.token)
    mutate(authResult)
  }

  const actions = {
    loadSession,
    requireAuthentication,
    signIn,
    signOut,
    confirmEmail,
    loadSubscriptions
  }

  const value: SessionContextType = {
    session,
    subscriptions,
    isSessionLoaded,
    user,
    isAuthenticated,
    actions
  }

  onMount(() => {
    loadSession()
  })

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
