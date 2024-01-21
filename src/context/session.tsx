import type { AuthModalSource } from '../components/Nav/AuthModal/types'
import type { AuthResult, MySubscriptionsQueryResult, User } from '../graphql/types.gen'
import type { Accessor, JSX, Resource } from 'solid-js'

import {
  createEffect,
  createContext,
  createMemo,
  createResource,
  createSignal,
  onMount,
  useContext,
} from 'solid-js'

import { resetToken, setToken } from '../graphql/graphQLClient'
import { showModal } from '../stores/ui'
import { apiClient } from '../utils/apiClient'

import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'

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
      modalSource: AuthModalSource,
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

const EMPTY_SUBSCRIPTIONS = {
  topics: [],
  authors: [],
}

export const SessionProvider = (props: { children: JSX.Element }) => {
  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [subscriptions, setSubscriptions] = createSignal<MySubscriptionsQueryResult>(EMPTY_SUBSCRIPTIONS)
  const { t } = useLocalize()
  const {
    actions: { showSnackbar },
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
    if (result) {
      setSubscriptions(result)
    } else {
      setSubscriptions(EMPTY_SUBSCRIPTIONS)
    }
  }

  const [session, { refetch: loadSession, mutate }] = createResource<AuthResult>(getSession, {
    ssrLoadFrom: 'initial',
    initialValue: null,
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

  const requireAuthentication = async (callback: () => void, modalSource: AuthModalSource) => {
    setIsAuthWithCallback(() => callback)

    await loadSession()

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
    setSubscriptions(EMPTY_SUBSCRIPTIONS)
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
    loadSubscriptions,
  }

  const value: SessionContextType = {
    session,
    subscriptions,
    isSessionLoaded,
    user,
    isAuthenticated,
    actions,
  }

  onMount(() => {
    loadSession()
  })

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
