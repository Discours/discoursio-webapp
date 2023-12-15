import type { AuthModalSource } from '../components/Nav/AuthModal/types'
import type { Author, Result } from '../graphql/schema/core.gen'
import type { Accessor, JSX, Resource } from 'solid-js'

import {
  VerifyEmailInput,
  LoginInput,
  AuthToken,
  User,
  Authorizer,
  ConfigType,
} from '@authorizerdev/authorizer-js'
import {
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  on,
  onMount,
  useContext,
} from 'solid-js'

import { apiClient } from '../graphql/client/core'
import { showModal } from '../stores/ui'

import { useLocalize } from './localize'
import { useSnackbar } from './snackbar'

const config: ConfigType = {
  authorizerURL: 'https://auth.discours.io',
  redirectURL: 'https://discoursio-webapp.vercel.app/?modal=auth',
  clientID: '9c113377-5eea-4c89-98e1-69302462fc08', // FIXME: use env?
}

export type SessionContextType = {
  user: User | null
  config: ConfigType
  session: Resource<AuthToken>
  isSessionLoaded: Accessor<boolean>
  subscriptions: Accessor<Result>
  author: Resource<Author | null>
  isAuthenticated: Accessor<boolean>
  isAuthWithCallback: Accessor<() => void>
  actions: {
    getToken: () => string
    loadSession: () => AuthToken | Promise<AuthToken>
    loadSubscriptions: () => Promise<void>
    requireAuthentication: (
      callback: (() => Promise<void>) | (() => void),
      modalSource: AuthModalSource,
    ) => void
    signIn: (params: LoginInput) => Promise<void>
    signOut: () => Promise<void>
    confirmEmail: (input: VerifyEmailInput) => Promise<void>
    setIsSessionLoaded: (loaded: boolean) => void
    setToken: (token: AuthToken | null) => void // setSession
    setUser: (user: User | null) => void
    authorizer: () => Authorizer
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

export const SessionProvider = (props: {
  onStateChangeCallback(state: any): unknown
  children: JSX.Element
}) => {
  const { t } = useLocalize()
  const {
    actions: { showSnackbar },
  } = useSnackbar()

  const [isSessionLoaded, setIsSessionLoaded] = createSignal(false)
  const [subscriptions, setSubscriptions] = createSignal<Result>(EMPTY_SUBSCRIPTIONS)
  const [token, setToken] = createSignal<AuthToken>()
  const [user, setUser] = createSignal<User>()

  const loadSubscriptions = async (): Promise<void> => {
    const result = await apiClient.getMySubscriptions()
    if (result) {
      setSubscriptions(result)
    } else {
      setSubscriptions(EMPTY_SUBSCRIPTIONS)
    }
  }

  const setAuth = (auth: AuthToken | void) => {
    if (auth) {
      setToken(auth)
      setUser(auth.user)
      mutate(auth)
    }
  }

  const getSession = async (): Promise<AuthToken> => {
    try {
      const tkn = getToken()
      console.debug('[context.session] token before: ', tkn)
      const authResult = await authorizer().getSession({
        Authorization: tkn,
      })
      if (authResult?.access_token) {
        setAuth(authResult)
        console.debug('[context.session] token after: ', authResult.access_token)
        await loadSubscriptions()
        return authResult
      }
    } catch (error) {
      console.error('[context.session] getSession error:', error)
      setAuth(null)
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

  const [author, { refetch: loadAuthor }] = createResource<Author | null>(
    async () => {
      const u = session()?.user
      if (u) {
        return (await apiClient.getAuthorId({ user: u.id })) ?? null
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
    const authResult: AuthToken | void = await authorizer().login(params)

    if (authResult && authResult.access_token) {
      setAuth(authResult)
      await loadSubscriptions()
      console.debug('[context.session] signed in')
    } else {
      console.info((authResult as AuthToken).message)
    }
  }

  const authorizer = createMemo(
    () =>
      new Authorizer({
        authorizerURL: config.authorizerURL,
        redirectURL: config.redirectURL,
        clientID: config.clientID,
      }),
  )

  createEffect(
    on(
      () => props.onStateChangeCallback,
      () => {
        props.onStateChangeCallback(token())
      },
      { defer: true },
    ),
  )

  const [configuration, setConfig] = createSignal<ConfigType>(config)

  onMount(async () => {
    setIsSessionLoaded(false)
    console.log('[context.session] loading...')
    const metaRes = await authorizer().getMetaData()
    setConfig({ ...config, ...metaRes, redirectURL: window.location.origin + '/?modal=auth' })
    console.log('[context.session] refreshing session...')
    const s = await getSession()
    console.debug('[context.session] session: ', s)
    console.log('[context.session] loading author...')
    const a = await loadAuthor()
    console.debug('[context.session] author: ', a)
    setIsSessionLoaded(true)
    console.log('[context.session] loaded')
  })

  const [isAuthWithCallback, setIsAuthWithCallback] = createSignal<() => void>()
  const requireAuthentication = async (callback: () => void, modalSource: AuthModalSource) => {
    setIsAuthWithCallback(() => callback)

    const userdata = await authorizer().getProfile()
    if (userdata) setUser(userdata)

    if (!isAuthenticated()) {
      showModal('auth', modalSource)
    }
  }

  const signOut = async () => {
    await authorizer().logout()
    setAuth(null)
    setSubscriptions(EMPTY_SUBSCRIPTIONS)
    showSnackbar({ body: t("You've successfully logged out") })
  }

  const confirmEmail = async (input: VerifyEmailInput) => {
    const at: void | AuthToken = await authorizer().verifyEmail(input)
    setAuth(at)
  }

  const getToken = createMemo(() => token()?.access_token)

  const actions = {
    getToken,
    loadSession,
    loadSubscriptions,
    requireAuthentication,
    signIn,
    signOut,
    confirmEmail,
    setIsSessionLoaded,
    setToken,
    setUser,
    authorizer,
  }
  const value: SessionContextType = {
    user: user(),
    config: configuration(),
    session,
    subscriptions,
    isSessionLoaded,
    isAuthenticated,
    author,
    actions,
    isAuthWithCallback,
  }

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>
}
