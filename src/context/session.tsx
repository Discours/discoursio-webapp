import type { AuthModalSource } from '../components/Nav/AuthModal/types'
import type { Author, Result } from '../graphql/schema/core.gen'
import type { Accessor, JSX, Resource } from 'solid-js'

import { VerifyEmailInput, LoginInput, AuthToken, User } from '@authorizerdev/authorizer-js'
import {
  createEffect,
  createContext,
  createMemo,
  createResource,
  createSignal,
  onMount,
  useContext,
} from 'solid-js'

import { apiClient } from '../graphql/client/core'
import { getToken, resetToken, setToken } from '../graphql/privateGraphQLClient'
import { showModal } from '../stores/ui'

import { useAuthorizer } from './authorizer'
import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'

export type SessionContextType = {
  session: Resource<AuthToken>
  isSessionLoaded: Accessor<boolean>
  subscriptions: Accessor<Result>
  user: Accessor<User>
  author: Resource<Author | null>
  isAuthenticated: Accessor<boolean>
  actions: {
    loadSession: () => AuthToken | Promise<AuthToken>
    loadSubscriptions: () => Promise<void>
    requireAuthentication: (
      callback: (() => Promise<void>) | (() => void),
      modalSource: AuthModalSource,
    ) => void
    signIn: (params: LoginInput) => Promise<void>
    signOut: () => Promise<void>
    confirmEmail: (input: VerifyEmailInput) => Promise<void>
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
  const [subscriptions, setSubscriptions] = createSignal<Result>(EMPTY_SUBSCRIPTIONS)
  const { t } = useLocalize()
  const {
    actions: { showSnackbar },
  } = useSnackbar()
  const [, { authorizer }] = useAuthorizer()
  const [authToken, setToken] = createSignal<string>('')

  const loadSubscriptions = async (): Promise<void> => {
    const result = await apiClient.getMySubscriptions()
    if (result) {
      setSubscriptions(result)
    } else {
      setSubscriptions(EMPTY_SUBSCRIPTIONS)
    }
  }

  const getSession = async (): Promise<AuthToken> => {
    try {
      const token = getToken() // FIXME: token in localStorage?
      const authResult = await authorizer().getSession({
        Authorization: token,
      })
      if (authResult) {
        console.log(authResult)
        setToken(authResult.access_token || authResult.id_token)
        loadSubscriptions()
        return authResult
      } else {
        return null
      }
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

  const [session, { refetch: loadSession, mutate }] = createResource<AuthToken>(getSession, {
    ssrLoadFrom: 'initial',
    initialValue: null,
  })

  const user = createMemo(() => session()?.user)

  const [author, { refetch: loadAuthor }] = createResource<Author | null>(
    async () => {
      const user = session()?.user
      if (user) {
        return (await apiClient.getAuthor({ user: user.id })) ?? null
      }
      return null
    },
    {
      ssrLoadFrom: 'initial',
      initialValue: null,
    },
  )

  const isAuthenticated = createMemo(() => Boolean(session()?.user))

  const signIn = async (params: LoginInput) => {
    const authResult = await authorizer().login(params)
    if (authResult) {
      setToken(authResult.access_token || authResult.id_token)
      mutate(authResult)
    }
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

  onMount(async () => {
    // Load the session and author data on mount
    await loadSession()
    loadAuthor()
  })

  const signOut = async () => {
    await authorizer().logout()
    mutate(null)
    resetToken()
    setSubscriptions(EMPTY_SUBSCRIPTIONS)
    showSnackbar({ body: t("You've successfully logged out") })
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    const authToken: void | AuthToken = await authorizer().verifyEmail(input)
    if (authToken) {
      setToken(authToken.access_token)
      mutate(authToken)
    }
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
    author,
    user,
    isAuthenticated,
    actions,
  }

  onMount(() => {
    loadSession()
  })
  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
